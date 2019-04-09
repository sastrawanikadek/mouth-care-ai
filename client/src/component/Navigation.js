import React, { useEffect, Fragment, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { withStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";

import { drawerWidth } from "../GlobalVariables";

const navigationMenu = [
  {
    label: "Dashboard",
    icon: "dashboard",
    url: "/dashboard"
  },
  {
    label: "Gejala",
    icon: "scatter_plot",
    url: "/symptom"
  },
  {
    label: "Penyakit",
    icon: "bug_report",
    url: "/disease"
  }
];

const styles = theme => ({
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "center"
  },
  active: {
    borderLeft: "5px solid #3f51b5"
  }
});

const Navigation = props => {
  const { classes, title, showSidebar, onShowSidebar } = props;
  const [utility, setUtility] = useState({
    redirect: false,
    redirectUrl: "/admin"
  });

  useEffect(() => {
    if (!localStorage.getItem("id")) {
      setUtility({
        ...utility,
        redirect: true
      });
    }
  }, []);

  const handleSidebar = () => {
    onShowSidebar(!showSidebar);
  };

  const handleLogout = () => {
    localStorage.removeItem("id");
    setUtility({
      ...utility,
      redirect: true
    });
  };

  return (
    <Fragment>
      <CssBaseline />

      <AppBar
        position="static"
        color="primary"
        className={classNames(
          classes.appBar,
          showSidebar && classes.appBarShift
        )}
      >
        <Toolbar>
          <IconButton
            aria-label="Toggle Sidebar"
            color="inherit"
            onClick={handleSidebar}
            className={classes.menuButton}
          >
            <Icon>{showSidebar ? "chevron_left" : "chevron_right"}</Icon>
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            {title}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={showSidebar}
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography variant="h6">Navigation</Typography>
        </div>
        <Divider />
        <List>
          {navigationMenu.map((menu, index) => (
            <ListItem
              button
              component="a"
              key={menu.label + index}
              href={menu.url}
              className={title === menu.label ? classes.active : null}
            >
              <ListItemIcon>
                <Icon>{menu.icon}</Icon>
              </ListItemIcon>
              <ListItemText primary={menu.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {utility.redirect && <Redirect to={utility.redirectUrl} />}
    </Fragment>
  );
};

Navigation.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  showSidebar: PropTypes.bool.isRequired,
  onShowSidebar: PropTypes.func.isRequired
};

export default withStyles(styles)(Navigation);
