const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginError.textContent = "";

  const data = new FormData(loginForm);
  const email = data.get("email");
  const password = data.get("password");

  try {
    await window.DKSY_DB.login(email, password);
    window.location.href = "./dashboard.html";
  } catch (error) {
    loginError.textContent = error.message || "登录失败，请检查邮箱和密码。";
    loginError.hidden = false;
  }
});
