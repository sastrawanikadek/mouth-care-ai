import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  chat: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: 3 * theme.spacing.unit,
    paddingRight: 3 * theme.spacing.unit,
    display: "flex",
    alignItems: "center",
    "&:last-child": {
      paddingBottom: "90px"
    }
  },
  mocaAIChat: {
    justifyContent: "flex-start",
    "& $chatBubble": {
      padding: theme.spacing.unit,
      maxWidth: "600px",
      backgroundColor: "white",
      textAlign: "justify",
      borderRadius: "3px",
      position: "relative",
      marginLeft: 2 * theme.spacing.unit,
      "&:before": {
        position: "absolute",
        content: "''",
        top: "calc(100% - 18px)",
        left: "-8px",
        borderWidth: "9px",
        borderStyle: "solid",
        borderColor: "transparent transparent white transparent"
      }
    }
  },
  userChat: {
    justifyContent: "flex-start",
    flexDirection: "row-reverse",
    "& $chatBubble": {
      padding: theme.spacing.unit,
      maxWidth: "600px",
      backgroundColor: "white",
      textAlign: "justify",
      borderRadius: "3px",
      position: "relative",
      marginRight: 2 * theme.spacing.unit,
      "&:before": {
        position: "absolute",
        content: "''",
        top: "calc(100% - 18px)",
        left: "calc(100% - 10px)",
        borderWidth: "9px",
        borderStyle: "solid",
        borderColor: "transparent transparent white transparent"
      }
    }
  },
  userAvatar: {
    backgroundColor: "#3f51b5"
  },
  avatar: {
    height: 5 * theme.spacing.unit,
    width: 5 * theme.spacing.unit,
    objectFit: "contain",
    objectPosition: "center"
  },
  chatBubble: {},
  text: {
    margin: 0
  }
});

const Chat = props => {
  const { classes, type, message } = props;

  return (
    <li
      className={classNames(
        classes.chat,
        type === "moca-ai" ? classes.mocaAIChat : classes.userChat
      )}
    >
      <Avatar className={classes.userAvatar}>
        {type === "moca-ai" ? (
          <img
            src="/images/avatar.png"
            alt="Moca AI"
            className={classes.avatar}
          />
        ) : (
          "U"
        )}
      </Avatar>
      <div className={classes.chatBubble}>
        <Typography variant="subtitle2">
          {message.split("\\n").length > 1
            ? message.split("\\n").map((msg, index) => (
                <p className={classes.text} key={msg + index}>
                  {Boolean(msg) ? msg : <br />}
                </p>
              ))
            : message}
        </Typography>
      </div>
    </li>
  );
};

Chat.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.oneOf(["user", "moca-ai"]).isRequired,
  message: PropTypes.string.isRequired
};

export default withStyles(styles)(Chat);
