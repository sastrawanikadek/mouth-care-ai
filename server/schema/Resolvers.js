const { Symptom, Disease, Consultation, Patient, Admin } = require("./Model");
const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.resolvers = {
  Query: {
    symptoms: () => Symptom.find(),
    diseases: () => Disease.find(),
    consultations: () => Consultation.find(),
    patients: () => Patient.find(),
    symptom: async (_, { id }) => {
      const symptom = await Symptom.findById(id);
      return symptom;
    },
    disease: async (_, { id }) => {
      const disease = await Disease.findById(id);
      return disease;
    },
    diseaseByName: async (_, { name }) => {
      const diseases = await Disease.find();

      const newDiseases = diseases.filter(disease =>
        name.find(diseaseName => (disease.name === diseaseName ? true : false))
      );

      return newDiseases;
    },
    diseaseBySymptoms: async (_, { symptoms }) => {
      const diseases = await Disease.find();
      const newDiseases = [];

      diseases.map(disease => {
        let symptomTotal = disease.symptoms.length;
        let counter = 0;

        disease.symptoms.map(dbSymptom => {
          symptoms.find(symptom => {
            if (symptom === dbSymptom.name) {
              counter++;
            }
          });
        });

        const percentage = counter / symptomTotal;

        if (percentage > 0) {
          newDiseases.push(disease);
        }
      });

      return newDiseases;
    },
    consultation: async (_, { id }) => {
      const consultation = await Consultation.findById(id);
      return consultation;
    },
    patient: async (_, { name, gender, dateOfBirth }) => {
      const patient = await Patient.findOne({ name, gender, dateOfBirth });
      return patient;
    },
    loginAdmin: async (_, { username, password }) => {
      const admin = await Admin.findOne({ username });

      if (admin) {
        const checkPassword = await bcrypt.compare(password, admin.password);

        if (checkPassword) {
          return admin;
        }
      }

      throw new Error("Invalid username or password");
    }
  },
  Mutation: {
    createSymptom: async (_, { name }) => {
      const symptom = new Symptom({
        name
      });

      await symptom.save();
      return symptom;
    },
    updateSymptom: async (_, { id, name }) => {
      const diseases = await Disease.find();

      diseases.map(async disease => {
        const index = disease.symptoms.findIndex(symptom => symptom.id == id);

        if (index >= 0) {
          disease.symptoms[index].name = name;

          await Disease.findByIdAndUpdate(disease.id, {
            $set: { symptoms: disease.symptoms }
          });
        }

        return true;
      });

      return await Symptom.findByIdAndUpdate(id, { $set: { name } });
    },
    deleteSymptom: async (_, { id }) => {
      const diseases = await Disease.find();

      diseases.map(async disease => {
        const index = disease.symptoms.findIndex(symptom => symptom.id == id);

        if (index >= 0) {
          disease.symptoms.splice(index, 1);

          await Disease.findByIdAndUpdate(disease.id, {
            $set: { symptoms: disease.symptoms }
          });
        }

        return true;
      });

      const symptom = await Symptom.findById(id);
      await Symptom.findByIdAndDelete(id);
      return symptom;
    },
    createDisease: async (_, { name, symptomId, solution }) => {
      const symptoms = [];

      for (let index = 0; index < symptomId.length; index++) {
        const symptom = await Symptom.findById(symptomId[index]);

        if (symptom) {
          symptoms.push({
            id: symptom.id,
            name: symptom.name
          });
          continue;
        }
        throw new Error(`Symptom with id: ${symptomId[index]} is not found`);
      }

      const disease = new Disease({
        name,
        symptoms,
        solution
      });

      await disease.save();
      return disease;
    },
    updateDisease: async (_, { id, name, symptomId, solution }) => {
      const symptoms = [];

      for (let index = 0; index < symptomId.length; index++) {
        const symptom = await Symptom.findById(symptomId[index]);

        if (symptom) {
          symptoms.push({
            id: symptom.id,
            name: symptom.name
          });
          continue;
        }
        throw new Error(`Symptom with id: ${symptomId[index]} is not found`);
      }

      const newDisease = await Disease.findByIdAndUpdate(id, {
        $set: { name, symptoms, solution }
      });
      return newDisease;
    },
    deleteDisease: async (_, { id }) => {
      try {
        const disease = await Disease.findById(id);
        await Disease.findByIdAndDelete(id);
        return disease;
      } catch (error) {
        throw new Error("Terjadi Kesalahan");
      }
    },
    createConsultation: async (
      _,
      { name, dateOfBirth, gender, diagnose, patientID }
    ) => {
      let patientData;

      if (!patientID) {
        const patient = new Patient({
          name,
          dateOfBirth,
          gender: gender === "Laki-laki" ? 1 : 2
        });

        patientData = await patient.save();
      }

      const consultation = new Consultation({
        dateTime: new Date(),
        diagnose,
        patient: patientID ? patientID : patientData.id
      });

      await consultation.save();

      return consultation;
    },
    createAdmin: async (_, { username, password }) => {
      const admin = new Admin({
        username,
        password: await bcrypt.hash(password, saltRounds)
      });

      await admin.save();
      return admin;
    }
  }
};
