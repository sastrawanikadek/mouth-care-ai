import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fab from "@material-ui/core/Fab";
import SendIcon from "mdi-react/SendIcon";
import { withStyles } from "@material-ui/core/styles";

import Chat from "./component/Chat";
import Modal from "./component/Modal";
import {
  PATIENT,
  DISEASE_BY_NAME,
  DISEASE_BY_SYMPTOMS,
  DISEASES
} from "./server/Query";
import { CREATE_CONSULTATION } from "./server/Mutation";

const styles = theme => ({
  "@global": {
    body: {
      backgroundColor: "#d9d9d9"
    }
  },
  root: {
    display: "flex"
  },
  appBar: {
    top: "auto",
    bottom: 0
  },
  form: {
    display: "flex",
    flexGrow: 1,
    padding: theme.spacing.unit
  },
  inputBase: {
    backgroundColor: "white",
    flexGrow: 1,
    borderRadius: "50px",
    padding: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    "& input": {
      textIndent: "10px"
    }
  },
  content: {
    marginTop: "65px",
    height: "auto",
    overflowY: "auto"
  },
  chatRoom: {
    listStyle: "none",
    margin: 0,
    padding: 0
  }
});

const Homepage = props => {
  const { classes, client } = props;
  const questions = {
    name: {
      type: "text",
      value: "Siapa nama Anda?"
    },
    gender: {
      type: "modal",
      value: "Apa jenis kelamin Anda?"
    },
    dateOfBirth: {
      type: "modal",
      value: "Tanggal berapa Anda lahir?"
    }
  };

  const [messages, setMessages] = useState([]);
  const [utility, setUtility] = useState({
    counter: 0,
    message: "",
    key: Object.entries(questions)[0][0],
    value: Object.entries(questions)[0][1],
    openModal: false
  });
  const [patient, setPatient] = useState({
    name: "",
    gender: "",
    dateOfBirth: ""
  });

  const getPatient = async () => {
    const userChat = {};

    messages.map(message => {
      if (message.type === "user") {
        userChat[message.key] = message.message;
      }
      return true;
    });

    const { data } = await client.query({
      query: PATIENT,
      variables: {
        name: userChat.name,
        gender: userChat.gender === "Laki-laki" ? 1 : 2,
        dateOfBirth: userChat.dateOfBirth
      }
    });

    return data.patient;
  };

  const handleChange = e => {
    setUtility({
      ...utility,
      message: e.target.value
    });
  };

  const handleCounter = () => {
    if (utility.counter < Object.entries(questions).length - 1) {
      setUtility({
        ...utility,
        counter: utility.counter + 1,
        message: "",
        key: Object.entries(questions)[utility.counter + 1][0],
        value: Object.entries(questions)[utility.counter + 1][1]
      });
    } else if (Object.entries(questions).length - 1 - utility.counter === 0) {
      if (patient.isOldPatient === undefined) {
        getPatient().then(res => {
          setPatient({
            ...patient,
            isOldPatient: res ? res.id : false,
            isKnowDisease: ""
          });

          questions["isKnowDisease"] = {
            type: "modal",
            value: "Apakah Anda sudah mengetahui penyakit yang Anda alami?"
          };

          setUtility({
            ...utility,
            counter: utility.counter + 1,
            message: "",
            key: Object.entries(questions)[utility.counter + 1][0],
            value: Object.entries(questions)[utility.counter + 1][1]
          });
        });
      }
    } else {
      if (messages[messages.length - 1].key === "isKnowDisease") {
        if (messages[messages.length - 1].message === "Tidak") {
          setPatient({
            ...patient,
            symptoms: ""
          });

          questions["symptoms"] = {
            type: "modal",
            value: "Gejala apa saja yang Anda rasakan?"
          };

          setUtility({
            ...utility,
            counter: utility.counter + 1,
            message: "",
            key: Object.entries(questions)[utility.counter][0],
            value: Object.entries(questions)[utility.counter][1]
          });
        } else {
          setPatient({
            ...patient,
            diseases: ""
          });

          questions["diseases"] = {
            type: "modal",
            value: "Penyakit apa saja yang Anda derita?"
          };

          setUtility({
            ...utility,
            counter: utility.counter + 1,
            message: "",
            key: Object.entries(questions)[utility.counter][0],
            value: Object.entries(questions)[utility.counter][1]
          });
        }
      } else if (
        messages[messages.length - 1].key === "symptoms" ||
        messages[messages.length - 1].key === "diseases"
      ) {
        const userChat = {};
        const latestKey = messages[messages.length - 1].key;

        messages.map(message => {
          if (message.type === "user") {
            userChat[message.key] = message.message;
          }
          return true;
        });

        userChat[latestKey] = userChat[latestKey].split(", ");

        if (latestKey === "symptoms") {
          client
            .query({
              query: DISEASES
            })
            .then(res => {
              const totalDisease = res.data.diseases.length;

              client
                .query({
                  query: DISEASE_BY_SYMPTOMS,
                  variables: {
                    symptoms: userChat[latestKey]
                  }
                })
                .then(result => {
                  const totalDiseaseBySymptoms =
                    result.data.diseaseBySymptoms.length;
                  const { diseaseBySymptoms } = result.data;
                  const naiveBayesData = [];
                  const diseaseID = [];
                  const copy = messages.slice();

                  diseaseBySymptoms.map(disease => {
                    const diseaseNaiveBayes = [];
                    const diseaseProbability = parseFloat(
                      (1 / totalDisease).toFixed(2)
                    );

                    userChat[latestKey].map(userSymptom =>
                      Boolean(
                        disease.symptoms.find(
                          symptom => symptom.name === userSymptom
                        )
                      )
                        ? diseaseNaiveBayes.push(
                            parseFloat(
                              (1 / totalDiseaseBySymptoms).toFixed(2)
                            ) * diseaseProbability
                          )
                        : diseaseNaiveBayes.push(0)
                    );

                    return naiveBayesData.push(diseaseNaiveBayes);
                  });

                  const totalNaiveBayes = [];

                  for (let i = 0; i < naiveBayesData.length; i++) {
                    let totalNaiveBayesThisDisease = 0;

                    for (let j = 0; j < naiveBayesData[i].length; j++) {
                      let divider = 0;

                      for (let k = 0; k < naiveBayesData.length; k++) {
                        divider += naiveBayesData[k][j];
                      }

                      totalNaiveBayesThisDisease +=
                        naiveBayesData[i][j] / divider;
                    }

                    totalNaiveBayes.push(totalNaiveBayesThisDisease);
                  }

                  diseaseBySymptoms.map((disease, index) => {
                    const symptomsName = [];

                    disease.symptoms.map(symptom =>
                      symptomsName.push(symptom.name)
                    );

                    const diseaseName =
                      "Nama Penyakit:\\n" + disease.name + "\\n\\n";
                    const diseasePercentage =
                      "Kemungkinan Menderita Penyakit:\\n" +
                      (
                        (totalNaiveBayes[index] /
                          totalNaiveBayes.reduce(
                            (total, value) => total + value
                          )) *
                        100
                      ).toFixed(2) +
                      "%\\n\\n";
                    const diseaseSymptoms =
                      "Gejala Penyakit:\\n" +
                      symptomsName.join(", ") +
                      "\\n\\n";
                    const diseaseSolution =
                      "Pengobatan Penyakit:\\n" +
                      (disease.solution
                        ? disease.solution
                        : "Mohon Maaf, Pengobatan untuk Penyakit ini Masih Belum Kami Ketahui. Mohon Periksakan ke Dokter untuk Detail Lebih Lengkap.");

                    copy.push({
                      type: "moca-ai",
                      key: "answer",
                      message:
                        diseaseName +
                        diseasePercentage +
                        diseaseSymptoms +
                        diseaseSolution
                    });

                    return diseaseID.push(disease.id);
                  });

                  client.mutate({
                    mutation: CREATE_CONSULTATION,
                    variables: {
                      name: userChat.name,
                      dateOfBirth: userChat.dateOfBirth,
                      gender: userChat.gender,
                      diagnose: diseaseID,
                      patientID: patient.isOldPatient
                        ? patient.isOldPatient
                        : null
                    }
                  });

                  setMessages(copy);
                });
            });
        } else {
          client
            .query({
              query: DISEASE_BY_NAME,
              variables: {
                name: userChat[latestKey]
              }
            })
            .then(res => {
              const { diseaseByName } = res.data;
              const copy = messages.slice();
              const diseaseID = [];

              diseaseByName.map(disease => {
                const symptomsName = [];

                disease.symptoms.map(symptoms =>
                  symptomsName.push(symptoms.name)
                );

                const diseaseName =
                  "Nama Penyakit:\\n" + disease.name + "\\n\\n";
                const diseaseSymptoms =
                  "Gejala Penyakit:\\n" + symptomsName.join(", ") + "\\n\\n";
                const diseaseSolution =
                  "Pengobatan Penyakit:\\n" +
                  (disease.solution
                    ? disease.solution
                    : "Mohon Maaf, Pengobatan untuk Penyakit ini Masih Belum Kami Ketahui. Mohon Periksakan ke Dokter untuk Detail Lebih Lengkap.");

                copy.push({
                  type: "moca-ai",
                  key: "answer",
                  message: diseaseName + diseaseSymptoms + diseaseSolution
                });

                return diseaseID.push(disease.id);
              });

              client.mutate({
                mutation: CREATE_CONSULTATION,
                variables: {
                  name: userChat.name,
                  dateOfBirth: userChat.dateOfBirth,
                  gender: userChat.gender,
                  diagnose: diseaseID,
                  patientID: patient.isOldPatient ? patient.isOldPatient : null
                }
              });

              setMessages(copy);
            });
        }
      }
    }
  };

  const handleSubmit = () => {
    if (messages.length > 0 && messages[messages.length - 1].key === "answer") {
      return false;
    } else if (utility.message) {
      const copy = messages.slice();
      copy.push({
        type: "user",
        key: utility.key,
        message: utility.message
      });

      setMessages(copy);
    }
  };

  const handleModal = status => {
    setUtility({
      ...utility,
      openModal: status
    });
  };

  const handleSubmitModal = value => {
    handleModal(false);

    const copy = messages.slice();
    copy.push({
      type: "user",
      key: utility.key,
      message: value
    });

    setMessages(copy);
  };

  useEffect(() => {
    const currentMessage = messages[messages.length - 1];
    if (currentMessage) {
      if (currentMessage.key === "answer") {
        handleModal(false);
      } else if (utility.value.type === "modal") {
        handleModal(true);
      }

      if (currentMessage.type === "user") {
        handleCounter();
      }
    }

    const content = document.getElementById("content");
    content.scrollTop = content.scrollHeight - content.clientHeight;

    return;
  }, [messages]);

  useEffect(() => {
    const copy = messages.slice();
    copy.push({
      type: "moca-ai",
      key: "question",
      message: utility.value.value
    });
    setMessages(copy);
    return;
  }, [utility.key]);

  return (
    <Fragment>
      <CssBaseline />
      <AppBar color="primary">
        <Toolbar>
          <img src="/images/logo.png" alt="Moca AI Logo" height="50" />
          <Typography
            color="inherit"
            variant="h6"
            style={{ marginLeft: "8px" }}
          >
            Mouth Care AI
          </Typography>
        </Toolbar>
      </AppBar>

      <main id="content" className={classes.content}>
        <ul className={classes.chatRoom}>
          <Chat type="moca-ai" message="Selamat datang di Mouth Care AI 😊" />
          {messages.map(msg => (
            <Chat
              key={messages.indexOf(msg)}
              type={msg.type}
              message={msg.message}
            />
          ))}

          {messages.length > 0 &&
            messages[messages.length - 1].key === "answer" && (
              <Chat
                type="moca-ai"
                message="Terima kasih telah menggunakan layanan Mouth Care AI\nSemoga Lekas Sembuh 🙏"
              />
            )}
        </ul>
      </main>

      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar>
          <form
            className={classes.form}
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <InputBase
              className={classes.inputBase}
              placeholder="Type your message"
              onChange={handleChange}
              value={utility.message}
              disabled={
                messages.length > 0 &&
                messages[messages.length - 1].key === "answer"
              }
            />
            <Fab type="submit" color="primary">
              <SendIcon />
            </Fab>
          </form>
        </Toolbar>
      </AppBar>

      <Modal
        open={utility.openModal}
        type={utility.key}
        onSubmit={handleSubmitModal}
        client={client}
      />
    </Fragment>
  );
};

Homepage.propTypes = {
  client: PropTypes.any.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Homepage);
