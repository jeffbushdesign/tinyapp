# tinyapp

Cookie Parser Read-me
https://github.com/expressjs/cookie-parser

Test Locally
http://localhost:8080/urls

Form in \_header.ejs

<form method="POST" action="/login" class="form-inline">
  <input
    class="form-control"
    type="text"
    name="username"
    placeholder="Username"
    style="width: 200px; margin: 1em"
  />
  <button
    type="submit"
    style="
      background-color: transparent;
      border-color: darkslategray;
      color: darkslategray;
    "
    class="btn btn-primary"
  >
    Login
  </button>
</form>

Old login form
<% if (user) { %>
<form method="POST" action="/logout">
<div class="form-group mb-2">
<label>Logged In As: <b><%= user.email %></b></label>
<button
          type="submit"
          style="
            background-color: transparent;
            border-color: darkslategray;
            color: darkslategray;
          "
          class="btn btn-primary"
        >
Logout
</button>
</div>
</form>
<% } else{ %>
<form method="POST" action="/login" class="form-inline">
<input
        class="form-control"
        type="text"
        name="username"
        placeholder="Username"
        style="width: 200px; margin: 1em"
      />
<button
        type="submit"
        style="
          background-color: transparent;
          border-color: darkslategray;
          color: darkslategray;
        "
        class="btn btn-primary"
      >
Login
</button>
</form>
<% } %>

      <div class="form-group mb-2">
        <button
          type="submit"
          style="
            background-color: transparent;
            border-color: darkslategray;
            color: darkslategray;
          "
          class="btn btn-primary"
        >
          Test
        </button>
        <button
          type="submit"
          style="
            background-color: transparent;
            border-color: darkslategray;
            color: darkslategray;
          "
          class="btn btn-primary"
        >
          Login
        </button>
      </div>

    </form>
