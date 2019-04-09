import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

import Homepage from "./Homepage";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Symptom from "./Symptom";
import Disease from "./Disease";

const client = new ApolloClient({
  uri: process.env.REACT_APP_APOLLO_CLIENT
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={props => <Homepage {...props} client={client} />}
        />
        <Route
          exact
          path="/admin"
          render={props => <Login {...props} client={client} />}
        />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route
          exact
          path="/symptom"
          render={props => <Symptom {...props} client={client} />}
        />
        <Route
          exact
          path="/disease"
          render={props => <Disease {...props} client={client} />}
        />
      </Switch>
    </Router>
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
