import React, { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import DateFnsUtils from "@date-io/date-fns";

import { Query } from "react-apollo";
import { withStyles } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider, DatePicker } from "material-ui-pickers";

import { monthName } from "../GlobalVariables";
import { SYMPTOMS, DISEASES } from "../server/Query";

const styles = theme => ({
  dialogTitle: {
    paddingBottom: "20px"
  },
  dialogContentText: {
    marginBottom: 3 * theme.spacing.unit
  }
});

const Modal = props => {
  const { classes, open, type, onSubmit } = props;
  const [dialogValue, setDialogValue] = useState({
    text: "",
    date: new Date(),
    radio: "",
    checkbox: {}
  });

  const handleReset = () => {
    setDialogValue({
      text: "",
      date: new Date(),
      radio: "",
      checkbox: {}
    });
  };

  const handleDateChange = date => {
    const newDate = new Date(date);
    const text =
      newDate.getDate() +
      " " +
      monthName[newDate.getMonth()] +
      " " +
      newDate.getFullYear();

    setDialogValue({
      ...dialogValue,
      text,
      date
    });
  };

  const handleRadioChange = e => {
    const { value } = e.target;

    setDialogValue({
      ...dialogValue,
      radio: value
    });
  };

  const handleCheckboxChange = name => e => {
    if (e.target.checked) {
      setDialogValue({
        ...dialogValue,
        checkbox: {
          ...dialogValue.checkbox,
          [name]: e.target.value
        }
      });
    } else {
      const copy = {
        ...dialogValue.checkbox
      };

      delete copy[name];

      setDialogValue({
        ...dialogValue,
        checkbox: copy
      });
    }
  };

  const handleSubmit = () => {
    if (dialogValue.text) {
      onSubmit(dialogValue.text);
    } else if (dialogValue.radio) {
      onSubmit(dialogValue.radio);
    } else if (Object.entries(dialogValue.checkbox).length > 0) {
      onSubmit(Object.values(dialogValue.checkbox).join(", "));
    }
    handleReset();
  };

  const dialog = {
    gender: {
      title: "Jenis Kelamin",
      body: "Mohon pilih jenis kelamin Anda",
      input: (
        <RadioGroup
          aria-label="Gender"
          name="gender"
          value={dialogValue.radio}
          onChange={handleRadioChange}
        >
          <FormControlLabel
            value="Laki-laki"
            label="Laki-laki"
            control={<Radio color="primary" />}
          />
          <FormControlLabel
            value="Perempuan"
            label="Perempuan"
            control={<Radio color="primary" />}
          />
        </RadioGroup>
      )
    },
    dateOfBirth: {
      title: "Tanggal Lahir",
      body: "Mohon masukkan tanggal lahir Anda",
      input: (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            color="primary"
            variant="outlined"
            label="Tanggal Lahir"
            format="dd MMM yyyy"
            openTo="year"
            views={["year", "month", "day"]}
            value={dialogValue.date}
            onChange={handleDateChange}
            disableFuture
            fullWidth
          />
        </MuiPickersUtilsProvider>
      )
    },
    isKnowDisease: {
      title: "Penyakit",
      body: "Apakah Anda sudah mengetahui penyakit yang Anda alami?",
      input: (
        <RadioGroup
          aria-label="Is Know Disease"
          name="isKnowDisease"
          value={dialogValue.radio}
          onChange={handleRadioChange}
        >
          <FormControlLabel
            value="Iya"
            label="Iya"
            control={<Radio color="primary" />}
          />
          <FormControlLabel value="Tidak" label="Tidak" control={<Radio />} />
        </RadioGroup>
      )
    },
    symptoms: {
      title: "Gejala Penyakit",
      body: "Gejala apa saja yang Anda rasakan?",
      input: (
        <Query query={SYMPTOMS}>
          {({ loading, data: { symptoms } }) => {
            if (loading)
              return (
                <Typography variant="subheading" align="center">
                  Loading ...
                </Typography>
              );

            return (
              <FormGroup>
                {symptoms.map(symptom => (
                  <FormControlLabel
                    key={symptom.id}
                    control={
                      <Checkbox
                        checked={Boolean(dialogValue.checkbox[symptom.id])}
                        onChange={handleCheckboxChange(symptom.id)}
                        value={symptom.name}
                      />
                    }
                    label={symptom.name}
                  />
                ))}
              </FormGroup>
            );
          }}
        </Query>
      )
    },
    diseases: {
      title: "Penyakit",
      body: "Penyakit apa saja yang Anda derita?",
      input: (
        <Query query={DISEASES}>
          {({ loading, data: { diseases } }) => {
            if (loading)
              return (
                <Typography variant="subheading" align="center">
                  Loading ...
                </Typography>
              );

            return (
              <FormGroup>
                {diseases.map(disease => (
                  <FormControlLabel
                    key={disease.id}
                    control={
                      <Checkbox
                        checked={Boolean(dialogValue.checkbox[disease.id])}
                        onChange={handleCheckboxChange(disease.id)}
                        value={disease.name}
                      />
                    }
                    label={disease.name}
                  />
                ))}
              </FormGroup>
            );
          }}
        </Query>
      )
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog
      aria-labelledby="dialog-title"
      open={open}
      onEnter={handleReset}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle id="dialog-title" className={classes.dialogTitle}>
        {dialog[type].title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={classes.dialogContentText}>
          {dialog[type].body}
        </DialogContentText>
        {dialog[type].input}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

Modal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default withStyles(styles)(Modal);
