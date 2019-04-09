import gql from "graphql-tag";

export const PATIENT = gql`
  query($name: String!, $gender: Int!, $dateOfBirth: String!) {
    patient(name: $name, gender: $gender, dateOfBirth: $dateOfBirth) {
      id
      name
      gender
      dateOfBirth
    }
  }
`;

export const SYMPTOMS = gql`
  query {
    symptoms {
      id
      name
    }
  }
`;

export const SYMPTOM = gql`
  query($id: ID!) {
    symptom(id: $id) {
      id
      name
    }
  }
`;

export const DISEASES = gql`
  query {
    diseases {
      id
      name
      symptoms {
        id
        name
      }
      solution
    }
  }
`;

export const DISEASE = gql`
  query($id: ID!) {
    disease(id: $id) {
      id
      name
      symptoms {
        id
        name
      }
      solution
    }
  }
`;

export const DISEASE_BY_NAME = gql`
  query($name: [String]!) {
    diseaseByName(name: $name) {
      id
      name
      symptoms {
        id
        name
      }
      solution
    }
  }
`;

export const DISEASE_BY_SYMPTOMS = gql`
  query($symptoms: [String]!) {
    diseaseBySymptoms(symptoms: $symptoms) {
      id
      name
      symptoms {
        id
        name
      }
      solution
    }
  }
`;

export const LOGIN_ADMIN = gql`
  query($username: String!, $password: String!) {
    loginAdmin(username: $username, password: $password) {
      id
    }
  }
`;

export const CONSULTATIONS = gql`
  query {
    consultations {
      dateTime
      diagnose
      patient
    }
  }
`;
