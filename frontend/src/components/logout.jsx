

const LogoutButton = () => {

    const handleLogout = () => {
       localStorage.removeItem("access_token");
       localStorage.removeItem("refresh_token");   
        window.location.href = "/"; // Redirect to home or login
  };

  return (
      <button className="bg-red-500 m-2 p-2 text-white rounded-sm transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-red-700 ..."
      onClick={handleLogout}>
      Logout
    </button>
  );

};

export default LogoutButton;
