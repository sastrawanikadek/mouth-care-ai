const { gql } = require("apollo-server");

exports.typeDefs = gql`
  type Symptom {
    id: ID!
    name: String!
  }

  type Disease {
    id: ID!
    name: String!
    symptoms: [Symptom]!
    solution: String!
  }

  type Consultation {
    id: ID!
    dateTime: String!
    diagnose: [ID]!
    patient: ID!
  }

  type Patient {
    id: ID!
    name: String!
    dateOfBirth: String!
    gender: Int!
  }

  type Admin {
    id: ID!
    username: String!
    password: String!
  }

  type Query {
    symptoms: [Symptom]
    diseases: [Disease]
    consultations: [Consultation]
    patients: [Patient]
    symptom(id: ID!): Symptom
    disease(id: ID!): Disease
    diseaseByName(name: [String]!): [Disease]
    diseaseBySymptoms(symptoms: [String]!): [Disease]
    consultation(id: ID!): Consultation
    patient(name: String!, gender: Int!, dateOfBirth: String!): Patient
    loginAdmin(username: String!, password: String!): Admin
  }

  type Mutation {
    createSymptom(name: String!): Symptom
    updateSymptom(id: ID!, name: String!): Symptom
    deleteSymptom(id: ID!): Symptom
    createDisease(name: String!, symptomId: [ID!]!, solution: String!): Disease
    updateDisease(
      id: ID!
      name: String!
      symptomId: [ID!]!
      solution: String!
    ): Disease
    deleteDisease(id: ID!): Disease
    createConsultation(
      name: String!
      dateOfBirth: String!
      gender: String!
      diagnose: [ID]!
      patientID: ID
    ): Consultation
    createAdmin(username: String!, password: String!): Admin
  }
`;
