<template>
  <div class="login-page">
    <div class="login-overlay"></div>

    <section class="login-panel">
      <h1 class="platform-title">智能工厂2030管控平台</h1>
      <p class="login-tip">欢迎您，请登录</p>
      <p class="welcome-text">Welcome</p>

      <div class="custom-form">
        <div class="input-wrapper" :class="{ 'is-active': userFocus }">
          <img
            src="~@/assets/images/login/user.png"
            class="prefix-icon"
            alt="user"
          />
          <input
            v-model.trim="form.username"
            type="text"
            placeholder="用户名"
            @focus="userFocus = true"
            @blur="userFocus = false"
            autocomplete="off"
          />
        </div>

        <div class="input-wrapper password" :class="{ 'is-active': pwdFocus }">
          <img
            :src="
              showPassword
                ? require('@/assets/images/login/show_keyword.png')
                : require('@/assets/images/login/hide_keyword.png')
            "
            class="prefix-icon clickable-icon"
            alt="password toggle"
            @click="showPassword = !showPassword"
          />
          <input
            v-model.trim="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            @focus="pwdFocus = true"
            @blur="pwdFocus = false"
            @keyup.enter="handleLogin"
            autocomplete="off"
          />
        </div>

        <button
          class="custom-btn login-btn"
          @click="handleLogin"
          :disabled="loading"
        >
          {{ loading ? "登录中..." : "登录" }}
        </button>

        <button class="custom-btn exit-btn" @click="handleExit">退出</button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      loading: false,
      userFocus: false,
      pwdFocus: false,
      showPassword: false,
      form: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    handleLogin() {
      // if (!this.form.username || !this.form.password) {
      //   this.$message && this.$message.warning("请输入用户名和密码");
      //   return;
      // }

      this.loading = true;

      setTimeout(() => {
        sessionStorage.setItem("token", "demo-token");
        sessionStorage.setItem(
          "userInfo",
          JSON.stringify({
            name: this.form.username || "admin",
            roles: ["admin"],
          }),
        );

        this.loading = false;
        this.$message && this.$message.success("登录成功");
        this.$router.push("/xy-factory").catch(() => {});
      }, 400);
    },
    handleExit() {
      this.form.username = "";
      this.form.password = "";
    },
  },
};
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4.2vw;
  box-sizing: border-box;
  background: url("~@/assets/images/login/page_bg1.png") center/100% 100%
    no-repeat;
}

.login-overlay {
  position: absolute;
  inset: 0;
  // background:
  //   radial-gradient(circle at 75% 28%, rgba(90, 154, 255, 0.32), transparent 38%),
  //   linear-gradient(180deg, rgba(16, 45, 89, 0.2), rgba(7, 17, 36, 0.78));
}

.login-panel {
  position: relative;
  z-index: 1;
  width: 27.77rem;
  max-width: 92vw;
  height: 38.79rem;
  border-radius: 0.375rem;
  border: none;
  padding: 4.8rem 2.125rem 1.75rem;
  box-sizing: border-box;
  background: url("~@/assets/images/login/login_bg.png") center/100% 100%
    no-repeat;
  margin-right: 2.5vw;
  margin-bottom: 4.4vh;
}

.platform-title {
  margin: 0;
  font-size: var(--font-size-32);
  font-family: var(--font-family-primary-Bold);
  line-height: 1.2;
  color: #ffffff;
  letter-spacing: 0.079rem;
  text-align: center;
}

.login-tip {
  margin: 2.65rem 0 0.375rem;
  text-align: center;
  font-family: var(--font-family-primary-Regular);
  font-size: var(--font-size-24);
  color: #ffffff;
  letter-spacing: 0.0625rem;
}

.welcome-text {
  margin: 0.6rem 0 2.55rem;
  text-align: center;
  font-size: var(--font-size-24);
  line-height: 1;
  font-style: italic;
  font-weight: 700;
  color: #9bf8ff;
  letter-spacing: 0.0625rem;
}

.custom-form {
  display: flex;
  flex-direction: column;
  // gap: 1.25rem;
  padding: 0 0.6rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 2.9rem;
  border: 0.0625rem solid rgba(145, 186, 255, 0.45);
  border-radius: 0.25rem;
  background: rgba(66, 99, 150, 0.56);
  padding: 0 0.8rem;
  transition: all 0.3s ease;

  &.is-active {
    border-color: #3b85ff;
    background: rgba(28, 50, 88, 0.8);
  }

  .prefix-icon {
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain;
    margin-right: 0.75rem;
    opacity: 0.7;
    transition: opacity 0.3s ease;

    &.clickable-icon {
      cursor: pointer;
    }
  }

  &.is-active .prefix-icon {
    opacity: 1;
  }

  input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #e8f3ff;
    font-size: var(--font-size-16);
    font-family: var(--font-family-primary-Regular);

    &::placeholder {
      color: rgba(182, 205, 236, 0.6);
    }
  }
}
.password {
  margin-top: 1.05rem;
}

.custom-btn {
  width: 100%;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: var(--font-size-16);
  font-family: var(--font-family-primary-Medium);
  font-weight: 500;
  transition: all 0.3s ease;
  letter-spacing: 0.125rem;

  &.login-btn {
    height: 2.9rem;
    margin-top: 4.55rem;
    border-radius: 0.25rem;
    background: rgba(5, 94, 241, 0.9);
    color: #ffffff;

    &:hover {
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.1)
        ),
        rgba(5, 94, 241, 0.9);
    }

    &:active {
      background: #0b409c;
    }

    &[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &.exit-btn {
    background: transparent;
    color: #4d94ff;
    height: 2.25rem;
    margin-top: 0.25rem;

    &:hover {
      color: #9bf8ff;
    }
  }
}

@media (max-width: 768px) {
  .login-page {
    justify-content: center;
    padding: 1.125rem;
  }

  .login-panel {
    margin-right: 0;
    height: auto;
    min-height: 31.25rem;
    padding: 2.125rem 1.375rem 1.375rem;
  }
}
</style>
