import { FormControl } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://3.6.177.137:7000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setChats, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setChats(v => 
          v.map(user_chat => {
            if (user_chat._id === selectedChat._id) {
              return { ...user_chat, latestMessage: data };
            }
            return user_chat;
          })
        );

        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io("wss://chit-chat.run.place", { transports: ["websocket"] });;
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setChats((chats) => 
          chats?.map((chat) => {
            if (chat?._id === selectedChat?._id) {
              return { ...chat, latestMessage: newMessageRecieved };
            }
            return chat;
          })
        );

        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
    {selectedChat ? (
      <>
        <Text
          fontSize={{ base: "28px", md: "30px" }}
          pb={3}
          px={2}
          w="100%"
          fontFamily="Work sans"
          display="flex"
          // bg="#1A202C"
          // textColor={"black"}
          justifyContent={{ base: "space-between" }}
          alignItems="center"
          color="white" // Text color for dark theme
        >
          <IconButton
            display={{ base: "flex", md: "none" }}
            icon={<ArrowBackIcon />}
            onClick={() => setSelectedChat("")}
            colorScheme="whiteAlpha" // Icon color for dark theme
          />
          {messages &&
            (!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderFull(user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            ))}
        </Text>
        <Box
          display="flex"
          flexDir="column"
          justifyContent="flex-end"
          p={3}
          bg="#1A202C" // Dark background color
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
          mt={4} // Added margin top for spacing
        >
          {loading ? (
            <Spinner
              size="xl"
              w={20}
              h={20}
              alignSelf="center"
              margin="auto"
              color="white" // Spinner color for dark theme
            />
          ) : (
            <div className="messages">
              <ScrollableChat messages={messages} />
            </div>
          )}

          <FormControl
            onKeyDown={sendMessage}
            id="first-name"
            isRequired
            mt={3}
          >
            {istyping ? (
              <div>
                <Lottie
                  options={defaultOptions}
                  width={50}
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              </div>
            ) : null}
            <Input
              variant="filled"
              bg="#2D3748" // Darker input background
              placeholder="Enter a message.."
              value={newMessage}
              onChange={typingHandler}
              color="white" // Input text color for dark theme
            />
          </FormControl>
        </Box>
      </>
    ) : (
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <Text fontSize="3xl" pb={3} fontFamily="Work sans" color="white">
          Click on a user to start chatting
        </Text>
      </Box>
    )}
  </>
  );
};

export default SingleChat;