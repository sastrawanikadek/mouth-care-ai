import React, { useEffect, Fragment, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { withStyles } from "@material-ui/core/styles";
import { Query } from "react-apollo";

import Navigation from "./component/Navigation";
import { drawerWidth } from "./GlobalVariables";
import { SYMPTOMS, SYMPTOM } from "./server/Query";
import {
  CREATE_SYMPTOM,
  UPDATE_SYMPTOM,
  DELETE_SYMPTOM
} from "./server/Mutation";

const styles2 = theme => ({
  dialogTitle: {
    paddingBottom: "20px"
  },
  dialogContentText: {
    marginBottom: 3 * theme.spacing.unit
  }
});

const CreateSymptom = props => {
  const { classes, open, onClose, client } = props;
  const [formValue, setFormValue] = useState({
    name: ""
  });

  const handleChange = name => e => {
    setFormValue({
      ...formValue,
      [name]: e.target.value
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (formValue.name) {
      client
        .mutate({
          mutation: CREATE_SYMPTOM,
          variables: {
            name: formValue.name
          },
          update: (cache, { data: { createSymptom } }) => {
            const data = cache.readQuery({
              query: SYMPTOMS
            });
            data.symptoms.push(createSymptom);
            cache.writeQuery({
              query: SYMPTOMS,
              data
            });
          }
        })
        .then(() => {
          alert("Tambah Data Berhasil");
          return setFormValue({
            name: ""
          });
        });
    }
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} autoComplete="off" noValidate>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
          Tambah Gejala
        </DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            label="Nama Gejala"
            type="text"
            margin="normal"
            value={formValue.name}
            onChange={handleChange("name")}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const CreateSymptomModal = withStyles(styles2)(CreateSymptom);

const EditSymptom = props => {
  const { classes, data, open, onClose, client } = props;
  const [formValue, setFormValue] = useState({
    name: ""
  });

  useEffect(() => {
    setFormValue({
      name: data.name
    });
  }, [data]);

  const handleChange = name => e => {
    setFormValue({
      ...formValue,
      [name]: e.target.value
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (formValue.name) {
      client
        .mutate({
          mutation: UPDATE_SYMPTOM,
          variables: {
            id: data.id,
            name: formValue.name
          },
          update: (cache, { data: { updateSymptom } }) => {
            const data = cache.readQuery({
              query: SYMPTOMS
            });

            const index = data.symptoms.findIndex(
              symptom => symptom.id === updateSymptom.id
            );

            updateSymptom.name = formValue.name;

            data.symptoms[index] = updateSymptom;

            cache.writeQuery({
              query: SYMPTOMS,
              data
            });
          }
        })
        .then(() => {
          return alert("Edit Data Berhasil");
        });
    }
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} autoComplete="off" noValidate>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
          Edit Gejala
        </DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            label="Nama Gejala"
            type="text"
            margin="normal"
            value={formValue.name}
            onChange={handleChange("name")}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const EditSymptomModal = withStyles(styles2)(EditSymptom);

const styles = theme => ({
  paper: {
    width: "calc(100% - 32px)",
    margin: "32px auto",
    overflowX: "auto",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  paperShift: {
    width: `calc(100% - (32px + ${drawerWidth}px))`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: drawerWidth + 2 * theme.spacing.unit
  },
  tableTitle: {
    flexGrow: 1
  },
  table: {
    width: "100%"
  }
});

const Symptom = props => {
  const { classes, client } = props;
  const [utility, setUtility] = useState({
    sidebar: true,
    openModal: false,
    modal: "",
    data: null
  });

  useEffect(() => {
    document.title = "Gejala";
  }, []);

  const handleSidebar = status => {
    setUtility({
      ...utility,
      sidebar: status
    });
  };

  const handleOpenAddModal = () => {
    setUtility({
      ...utility,
      openModal: true,
      modal: "tambah"
    });
  };

  const handleOpenEditModal = id => {
    client
      .query({
        query: SYMPTOM,
        variables: { id }
      })
      .then(res => {
        const { symptom } = res.data;

        setUtility({
          ...utility,
          openModal: true,
          modal: "edit",
          data: symptom
        });
      });
  };

  const handleCloseModal = () => {
    setUtility({
      ...utility,
      openModal: false
    });
  };

  const handleDelete = (id, refetch) => () => {
    client
      .mutate({
        mutation: DELETE_SYMPTOM,
        variables: { id }
      })
      .then(() => {
        alert("Hapus Data Berhasil");
        return refetch();
      });
  };

  return (
    <Fragment>
      <Navigation
        title="Gejala"
        showSidebar={utility.sidebar}
        onShowSidebar={handleSidebar}
      />

      <Paper
        elevation={24}
        className={classNames(
          classes.paper,
          utility.sidebar && classes.paperShift
        )}
      >
        <Toolbar>
          <Typography variant="h6" className={classes.tableTitle}>
            Daftar Gejala
          </Typography>

          <Button color="primary" onClick={handleOpenAddModal}>
            Tambah Data
          </Button>
        </Toolbar>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align="center">No.</TableCell>
              <TableCell align="center">Nama</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Query query={SYMPTOMS}>
              {({ loading, data: { symptoms }, refetch }) => {
                if (loading)
                  return (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="subheading" align="center">
                          Loading ...{" "}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );

                return symptoms.map((symptom, index) => (
                  <TableRow key={symptom.id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{symptom.name}</TableCell>
                    <TableCell align="center">
                      <Button
                        color="primary"
                        onClick={() => handleOpenEditModal(symptom.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="secondary"
                        onClick={handleDelete(symptom.id, refetch)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              }}
            </Query>
          </TableBody>
        </Table>
      </Paper>

      {utility.modal === "tambah" ? (
        <CreateSymptomModal
          client={client}
          open={utility.openModal}
          onClose={handleCloseModal}
        />
      ) : (
        utility.modal === "edit" &&
        utility.data && (
          <EditSymptomModal
            client={client}
            data={utility.data}
            open={utility.openModal}
            onClose={handleCloseModal}
          />
        )
      )}
    </Fragment>
  );
};

Symptom.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Symptom);
