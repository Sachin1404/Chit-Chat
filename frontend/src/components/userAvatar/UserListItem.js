import { Avatar } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
// import { ChatState } from "../../Context/ChatProvider";

const UserListItem = ({ handleFunction,user1 }) => {
  // const { user } = ChatState();

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user1?.name}
        src={user1?.pic}
      />
      <Box>
        <Text>{user1?.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user1?.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;