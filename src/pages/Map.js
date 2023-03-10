import { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";
import axios from "axios";
import * as React from "react";
import Cookies from "universal-cookie";
import { Button } from "@chakra-ui/react";
import Homepage from "./HomePage";

// import required modules
import { useDisclosure } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Menu,
  MenuButton,
  MenuList,
  Avatar,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";

function Map() {
  const myStorage = window.localStorage;
  const mapRef = React.useRef();
  const { user, setUser } = ChatState();

  const [pins, setPins] = useState([]);

  const [markers, setMarkers] = useState([]);

  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const cookies = new Cookies();
  const history = useHistory();

  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const logoutHandler = () => {
    setUser(null);
    myStorage.removeItem("userInfo");
    cookies.remove("token");
  };

  useEffect(() => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      duration: 500,
    });
  }, [longitude, latitude]);

  useEffect(() => {
    const keys = Object.keys(pins).slice(0, 15);
    const arr = keys.map((key) => pins[key]);
    console.log(arr);
    setMarkers(arr);
  }, [pins]);
  const submitHandler = async () => {
    try {
      const cookieValue = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="));
      if (!cookieValue) return;
      const decoded = jwt_decode(cookieValue.split("=")[1]);
      const res = await axios.get(`/api/user/${decoded.id}`);
      localStorage.setItem("userInfo", JSON.stringify(res.data[0]));
      setUser(res.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    submitHandler();
  }, []);
  return (
    <div class="whole">
      <div class="header">
        {user ? (
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size={"sm"}
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <div>
            <span class="login-button">
              <a onClick={onLoginOpen}></a>
            </span>
          </div>
        )}
      </div>
      <>
        <Modal isOpen={isLoginOpen} onClose={onLoginClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody>
              <Homepage setonClick={onLoginClose} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    </div>
  );
}
export default Map;
