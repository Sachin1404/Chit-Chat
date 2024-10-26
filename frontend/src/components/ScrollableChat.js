import { Avatar } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '10px' }} key={m._id}>
            {/* Sender Avatar */}
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <ProfileModal user={user}>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
                </ProfileModal>
              </Tooltip>
            )}
            {/* Message Container */}
            <div style={{ display: "flex", alignItems: "flex-end", flex: 1 }}>
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#78d067" : "#E0E0E0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  position: "relative", // Added for positioning the time
                }}
              >
                {m.content}
              </span>
              {/* Timestamp */}
              <span
                style={{
                  fontSize: '12px', // Adjust as necessary
                  color: 'gray', // Adjust color as necessary
                  marginLeft: '10px', // Space between message and timestamp
                  marginBottom:'5px',
                  alignSelf: 'flex-end', // Align the timestamp to the bottom
                }}
              >
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
