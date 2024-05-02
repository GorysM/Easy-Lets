import React from 'react';
import Login from './components/Login';
import { NavigationBar } from './components/NavBar';
import ChatButton from './components/ChatButton';

function UserProfile () {
  return (
    <div>
      <NavigationBar/>
      <Login />
      <ChatButton/>
    </div>
  );
}

export default UserProfile;

