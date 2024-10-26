import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import { Box, Text } from "@chakra-ui/react";

const MyChat = ({ chat, loggedUser }) => {
  const { selectedChat, setSelectedChat } = ChatState();

  return (
    <Box
      onClick={() => setSelectedChat(chat)}
      cursor="pointer"
      bg={selectedChat?._id === chat?._id ? "#319795" : "#2D3748"} // Updated for dark theme
      color={selectedChat?._id === chat?._id ? "white" : "#CBD5E0"} // Light text for unselected, white for selected
      px={3}
      py={2}
      borderRadius="lg"
      key={chat._id}
      _hover={{ bg: "#4A5568" }} // Hover effect with darker shade
    >
      <Text>
        {!chat.isGroupChat
          ? getSender(loggedUser, chat.users)
          : chat.chatName}
      </Text>
      {chat.latestMessage && (
        <Text fontSize="xs" color="#A0AEC0"> {/* Lighter shade for the latest message */}
          <b>{chat.latestMessage.sender.name} : </b>
          {chat.latestMessage.content.length > 50
            ? chat.latestMessage.content.substring(0, 51) + "..."
            : chat.latestMessage.content}
        </Text>
      )}
    </Box>
  );
};

export default MyChat;
