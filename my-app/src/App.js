import logo from './logo.svg';
import './App.css';
import {Routes, Route} from 'react-router-dom';
import LoginPage from './LoginPage';
import UserProfilePage from './UserProfilePage';
import SignUpPage from './SignUpPage';
import { RequireToken} from './Auth'
function App() {
  return (
    <div className = "App">
    <Routes>
      <Route path="/" 
      element = {<LoginPage/>}/>
      <Route path="/sign_up" 
      element = {<SignUpPage/>}/>
      <Route path="/user_profile"
        element = {
        <RequireToken>
          <UserProfilePage />
        </RequireToken>
        }
      />
    </Routes>
    </div>
  );
}

export default App;
