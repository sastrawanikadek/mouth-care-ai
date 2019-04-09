import React, { useEffect, Fragment, useState } from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";

import { withStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { LOGIN_ADMIN } from "./server/Query";

const styles = theme => ({
  paper: {
    maxWidth: "678px",
    height: "auto",
    margin: "175px auto",
    padding: "24px 16px"
  },
  typography: {
    paddingTop: 2 * theme.spacing.unit,
    paddingBottom: 2 * theme.spacing.unit
  },
  form: {
    margin: "0 16px",
    padding: "16px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  button: {
    padding: "16px 64px",
    marginTop: 2 * theme.spacing.unit
  }
});

const Login = props => {
  const { classes, client } = props;
  const [formValue, setFormValue] = useState({
    username: "",
    password: ""
  });

  const [utility, setUtility] = useState({
    showPassword: false,
    redirect: false,
    redirectUrl: "/dashboard"
  });

  useEffect(() => {
    document.title = "Login";

    if (localStorage.getItem("id")) {
      setUtility({
        ...utility,
        redirect: true
      });
    }
  }, []);

  const handleChange = name => e => {
    setFormValue({
      ...formValue,
      [name]: e.target.value
    });
  };

  const handleTogglePassword = () => {
    setUtility({
      ...utility,
      showPassword: !utility.showPassword
    });
  };

  const handleSubmit = async () => {
    if (formValue.username && formValue.password) {
      const { username, password } = formValue;

      try {
        const data = await client.query({
          query: LOGIN_ADMIN,
          variables: {
            username,
            password
          }
        });

        const { id } = data.data.loginAdmin;

        localStorage.setItem("id", id);

        setUtility({
          ...utility,
          redirect: true
        });
      } catch (err) {
        alert("Username atau password salah");
      }
    }
  };

  return (
    <Fragment>
      <CssBaseline />

      <Paper elevation={24} className={classes.paper}>
        <Typography variant="h3" align="center" className={classes.typography}>
          Login
        </Typography>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className={classes.form}
          autoComplete="off"
          noValidate
        >
          <TextField
            variant="outlined"
            label="Username"
            type="text"
            margin="normal"
            value={formValue.username}
            onChange={handleChange("username")}
            required
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Password"
            type={utility.showPassword ? "text" : "password"}
            margin="normal"
            value={formValue.password}
            onChange={handleChange("password")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle Password"
                    onClick={handleTogglePassword}
                  >
                    <Icon>
                      {utility.showPassword ? "visibility_off" : "visibility"}
                    </Icon>
                  </IconButton>
                </InputAdornment>
              )
            }}
            required
            fullWidth
          />
          <Button
            variant="outlined"
            color="primary"
            type="submit"
            className={classes.button}
          >
            Login
          </Button>
        </form>
      </Paper>

      {utility.redirect && <Redirect to={utility.redirectUrl} />}
    </Fragment>
  );
};

Login.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);
