import React, { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { withStyles } from "@material-ui/core/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie
} from "recharts";

import Navigation from "./component/Navigation";
import { drawerWidth, monthName } from "./GlobalVariables";
import { CONSULTATIONS, DISEASES } from "./server/Query";
import { Query } from "react-apollo";

const styles = theme => ({
  content: {
    width: "calc(100% - 32px)",
    margin: "32px auto",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentShift: {
    width: `calc(100% - (32px + ${drawerWidth}px))`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: drawerWidth + 2 * theme.spacing.unit
  }
});

const Dashboard = props => {
  const { classes } = props;
  const [utility, setUtility] = useState({
    sidebar: true
  });

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const handleSidebar = status => {
    setUtility({
      ...utility,
      sidebar: status
    });
  };

  return (
    <Fragment>
      <Navigation
        title="Dashboard"
        showSidebar={utility.sidebar}
        onShowSidebar={handleSidebar}
      />

      <main
        className={classNames(
          classes.content,
          utility.sidebar && classes.contentShift
        )}
      >
        <Query query={CONSULTATIONS}>
          {({ loading, data: { consultations } }) => {
            if (loading) return "Loading";
            const data1 = [];

            monthName.map((name, index) => {
              let counter = 0;

              consultations.map(consultation => {
                if (
                  new Date(consultation.dateTime).getMonth() === index &&
                  new Date(consultation.dateTime).getFullYear() ===
                    new Date().getFullYear()
                ) {
                  return counter++;
                } else {
                  return false;
                }
              });

              const object = {
                time: name,
                total: counter
              };

              return data1.push(object);
            });

            return (
              <Grid container spacing={24}>
                <Grid item xs={12}>
                  <Paper elevation={24}>
                    <Typography variant="h6" align="center">
                      {`Statistik Konsultasi ${new Date().getFullYear()}`}
                    </Typography>

                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart
                        data={data1}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={24}>
                    <Typography variant="h6" align="center">
                      Statistik Diagnosa
                    </Typography>

                    <Query query={DISEASES}>
                      {({ loading, data: { diseases } }) => {
                        if (loading) return "Loading";

                        const data2 = [];

                        diseases.map(disease => {
                          let counter = 0;

                          consultations.map(consultation => {
                            return consultation.diagnose.map(diagnose => {
                              if (diagnose === disease.id) {
                                return counter++;
                              }
                              return false;
                            });
                          });

                          const object2 = {
                            name: disease.name,
                            value: counter
                          };

                          return data2.push(object2);
                        });

                        return (
                          <ResponsiveContainer width="100%" height={500}>
                            <PieChart width={400} height={400}>
                              <Pie
                                dataKey="value"
                                data={data2}
                                fill="#8884d8"
                                label
                              />
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        );
                      }}
                    </Query>
                  </Paper>
                </Grid>
              </Grid>
            );
          }}
        </Query>
      </main>
    </Fragment>
  );
};

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Dashboard);
