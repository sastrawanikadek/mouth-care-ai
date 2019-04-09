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
import FormGroup from "@material-ui/core/FormGroup";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import { withStyles } from "@material-ui/core/styles";
import { Query } from "react-apollo";

import Navigation from "./component/Navigation";
import { drawerWidth } from "./GlobalVariables";
import { DISEASES, SYMPTOMS, DISEASE } from "./server/Query";
import {
  CREATE_DISEASE,
  DELETE_DISEASE,
  UPDATE_DISEASE
} from "./server/Mutation";

const styles2 = theme => ({
  dialogTitle: {
    paddingBottom: "20px"
  },
  dialogContentText: {
    marginBottom: 3 * theme.spacing.unit
  }
});

const CreateDisease = props => {
  const { classes, open, onClose, client } = props;
  const [formValue, setFormValue] = useState({
    name: "",
    symptoms: [],
    solution: ""
  });

  const handleChange = name => e => {
    setFormValue({
      ...formValue,
      [name]: e.target.value
    });
  };

  const handleCheckboxChange = value => e => {
    const copy = formValue.symptoms.slice();

    if (e.target.checked) {
      copy.push(value);

      setFormValue({
        ...formValue,
        symptoms: copy
      });
    } else {
      const index = copy.indexOf(value);

      copy.splice(index, 1);

      setFormValue({
        ...formValue,
        symptoms: copy
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (formValue.name && formValue.symptoms.length > 0 && formValue.solution) {
      client
        .mutate({
          mutation: CREATE_DISEASE,
          variables: {
            name: formValue.name,
            symptomId: formValue.symptoms,
            solution: formValue.solution
          },
          update: (cache, { data: { createDisease } }) => {
            const data = cache.readQuery({
              query: DISEASES
            });
            data.diseases.push(createDisease);
            cache.writeQuery({
              query: DISEASES,
              data
            });
          }
        })
        .then(() => {
          alert("Tambah Data Berhasil");
          return setFormValue({
            name: "",
            symptoms: [],
            solution: ""
          });
        });
    }
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} autoComplete="off" noValidate>
        <DialogTitle id="dialog-title" className={classes.dialogTitle}>
          Tambah Penyakit
        </DialogTitle>
        <DialogContent>
          <Query query={SYMPTOMS}>
            {({ loading, data: { symptoms } }) => {
              if (loading)
                return (
                  <Typography variant="subheading" align="center">
                    Loading ...
                  </Typography>
                );

              return (
                <Fragment>
                  <TextField
                    variant="outlined"
                    label="Nama Penyakit"
                    type="text"
                    margin="normal"
                    value={formValue.name}
                    onChange={handleChange("name")}
                    fullWidth
                    required
                  />
                  <FormGroup>
                    {symptoms.map(symptom => (
                      <FormControlLabel
                        key={symptom.id}
                        control={
                          <Checkbox
                            checked={Boolean(
                              formValue.symptoms.find(
                                symptomValue => symptomValue === symptom.id
                              )
                            )}
                            onChange={handleCheckboxChange(symptom.id)}
                            value={symptom.id}
                          />
                        }
                        label={symptom.name}
                      />
                    ))}
                  </FormGroup>
                  <TextField
                    variant="outlined"
                    label="Solusi Penyakit"
                    type="text"
                    margin="normal"
                    value={formValue.solution}
                    onChange={handleChange("solution")}
                    fullWidth
                    required
                    multiline
                  />
                </Fragment>
              );
            }}
          </Query>
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

const CreateDiseaseModal = withStyles(styles2)(CreateDisease);

const EditDisease = props => {
  const { classes, data, open, onClose, client } = props;
  const [formValue, setFormValue] = useState({
    name: "",
    symptoms: [],
    solution: ""
  });

  useEffect(() => {
    setFormValue({
      name: data.name,
      symptoms: data.symptoms.map(symptom => symptom.id),
      solution: data.solution
    });
  }, [data]);

  const handleChange = name => e => {
    setFormValue({
      ...formValue,
      [name]: e.target.value
    });
  };

  const handleCheckboxChange = value => e => {
    const copy = formValue.symptoms.slice();

    if (e.target.checked) {
      copy.push(value);

      setFormValue({
        ...formValue,
        symptoms: copy
      });
    } else {
      const index = copy.indexOf(value);

      copy.splice(index, 1);

      setFormValue({
        ...formValue,
        symptoms: copy
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (formValue.name && formValue.symptoms.length > 0 && formValue.solution) {
      client
        .mutate({
          mutation: UPDATE_DISEASE,
          variables: {
            id: data.id,
            name: formValue.name,
            symptomId: formValue.symptoms,
            solution: formValue.solution
          },
          update: (cache, { data: { updateDisease } }) => {
            const data = cache.readQuery({
              query: DISEASES
            });

            const index = data.diseases.findIndex(
              disease => disease.id === updateDisease.id
            );

            client
              .query({
                query: SYMPTOMS
              })
              .then(res => {
                const symptoms = [];

                res.data.symptoms.map(symptom => {
                  if (
                    Boolean(
                      formValue.symptoms.find(
                        symptomId => symptomId === symptom.id
                      )
                    )
                  ) {
                    return symptoms.push(symptom);
                  } else {
                    return false;
                  }
                });

                updateDisease.name = formValue.name;
                updateDisease.symptoms = symptoms;
                updateDisease.solution = formValue.solution;

                data.diseases[index] = updateDisease;

                cache.writeQuery({
                  query: DISEASES,
                  data
                });
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
          Edit Penyakit
        </DialogTitle>
        <DialogContent>
          <Query query={SYMPTOMS}>
            {({ loading, data: { symptoms } }) => {
              if (loading)
                return (
                  <Typography variant="subheading" align="center">
                    Loading ...
                  </Typography>
                );

              return (
                <Fragment>
                  <TextField
                    variant="outlined"
                    label="Nama Penyakit"
                    type="text"
                    margin="normal"
                    value={formValue.name}
                    onChange={handleChange("name")}
                    fullWidth
                    required
                  />
                  <FormGroup>
                    {symptoms.map(symptom => (
                      <FormControlLabel
                        key={symptom.id}
                        control={
                          <Checkbox
                            checked={Boolean(
                              formValue.symptoms.find(
                                symptomValue => symptomValue === symptom.id
                              )
                            )}
                            onChange={handleCheckboxChange(symptom.id)}
                            value={symptom.id}
                          />
                        }
                        label={symptom.name}
                      />
                    ))}
                  </FormGroup>
                  <TextField
                    variant="outlined"
                    label="Solusi Penyakit"
                    type="text"
                    margin="normal"
                    value={formValue.solution}
                    onChange={handleChange("solution")}
                    fullWidth
                    required
                    multiline
                  />
                </Fragment>
              );
            }}
          </Query>
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

const EditDiseaseModal = withStyles(styles2)(EditDisease);

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

const Disease = props => {
  const { classes, client } = props;
  const [utility, setUtility] = useState({
    sidebar: true,
    openModal: false,
    modal: "",
    data: null
  });

  useEffect(() => {
    document.title = "Penyakit";
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
        query: DISEASE,
        variables: { id }
      })
      .then(res => {
        const { disease } = res.data;

        setUtility({
          ...utility,
          openModal: true,
          modal: "edit",
          data: disease
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
        mutation: DELETE_DISEASE,
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
        title="Penyakit"
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
            Daftar Penyakit
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
              <TableCell align="center">Gejala</TableCell>
              <TableCell align="center">Solusi</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Query query={DISEASES}>
              {({ loading, data: { diseases }, refetch }) => {
                if (loading)
                  return (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="subheading" align="center">
                          Loading ...{" "}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );

                return diseases.map((disease, index) => (
                  <TableRow key={disease.id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{disease.name}</TableCell>
                    <TableCell>
                      {disease.symptoms.map((symptom, index) =>
                        disease.symptoms.length === index + 1
                          ? symptom.name
                          : symptom.name + ", "
                      )}
                    </TableCell>
                    {disease.solution ? (
                      <TableCell>{disease.solution}</TableCell>
                    ) : (
                      <TableCell align="center">-</TableCell>
                    )}
                    <TableCell align="center">
                      <Button
                        color="primary"
                        onClick={() => handleOpenEditModal(disease.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="secondary"
                        onClick={handleDelete(disease.id, refetch)}
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
        <CreateDiseaseModal
          client={client}
          open={utility.openModal}
          onClose={handleCloseModal}
        />
      ) : (
        utility.modal === "edit" &&
        utility.data && (
          <EditDiseaseModal
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

Disease.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Disease);
