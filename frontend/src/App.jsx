import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import Login from "./pages/login.jsx";
import FileUpload from "./components/fileUpload.jsx";
import FileList from "./components/fliesList.jsx";
import Register from "./pages/register.jsx";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <div className="bg-slate-100 w-full h-100vh p-20">
                <FileUpload />
                <FileList />
              </div>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
