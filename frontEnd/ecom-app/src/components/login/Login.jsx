import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { BsFillEyeFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { clearErr, login, googleLogin } from "../../store/userSlice";
import { useAlert } from "react-alert";
import { STATUSES } from "../../store/userSlice";
import Loader from "../layout/loader/Loader";
import { GoogleLogin } from "@react-oauth/google";
import "animate.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const alert = useAlert();
  const location = useLocation();

  const { status, isAuthenticated, error: resError } = useSelector(
    (state) => state.user
  );

  // Handle login submit
  const handleLogin = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert.error("Please enter email and password");
      return;
    }

    dispatch(login({ email, password }));
  };

  // Handle redirect & errors
  useEffect(() => {
    if (resError) {
      alert.error(resError);
      setShake(true);
      dispatch(clearErr());
    }

    const params = new URLSearchParams(location.search)
    const redirect = params.get('redirect')|| 'products'
    // const redirect = location.search
    //   ? location.search.split("=")[1]
    //   : "products";

    if (isAuthenticated) {
      navigate(`/${redirect}`);
    }
  }, [isAuthenticated, resError, location, navigate, dispatch, alert]);

  if (status === STATUSES.LOADING) {
    return <Loader />;
  }

  return (
    <div
      className={
        shake
          ? "login-background animate__animated animate__shakeX"
          : "login-background"
      }
    >
      <div
        className={
          shake
            ? "inp-container animate__animated animate__shakeX"
            : "inp-container"
        }
      >
        <div className="wlcm">
          <h2>WELCOME BACK</h2>
          <p>Nice to see you again</p>
        </div>

        <div className="input">
          <h1 className="login">Login</h1>

          
          <form className="login-form" onSubmit={handleLogin}>
            <input
            required={true}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="input-span"></span>

            <div>
              <input
              required={true}
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="showPass"
                onClick={() => setShowPass(!showPass)}
              >
                <BsFillEyeFill />
              </button>
            </div>

            <span className="input-span"></span>

            <p>
              <Link to="/fogotpassword">Forgot Password</Link>
            </p>
            <div className="submit-btn">
              <button
                type="submit"
                className="signup"
                disabled={status === STATUSES.LOADING || !email.trim() || !password.trim()}
              >
                Login
              </button>

            </div>

          </form>
         

          <p className="redir">
            Don't have an account? <Link to="/signup">Register</Link>
          </p>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if(!credentialResponse?.credential){
                alert.error('Invalid Google response')
              }
              dispatch(googleLogin(credentialResponse.credential));
            }}
            onError={() => {
              alert.error("Google Login Failed");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
