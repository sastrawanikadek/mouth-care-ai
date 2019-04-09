import gql from "graphql-tag";

export const CREATE_CONSULTATION = gql`
  mutation(
    $name: String!
    $dateOfBirth: String!
    $gender: String!
    $diagnose: [ID]!
    $patientID: ID
  ) {
    createConsultation(
      name: $name
      dateOfBirth: $dateOfBirth
      gender: $gender
      diagnose: $diagnose
      patientID: $patientID
    ) {
      id
      dateTime
      diagnose
      patient
    }
  }
`;

export const CREATE_DISEASE = gql`
  mutation($name: String!, $symptomId: [ID!]!, $solution: String!) {
    createDisease(name: $name, symptomId: $symptomId, solution: $solution) {
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

export const UPDATE_DISEASE = gql`
  mutation($id: ID!, $name: String!, $symptomId: [ID!]!, $solution: String!) {
    updateDisease(
      id: $id
      name: $name
      symptomId: $symptomId
      solution: $solution
    ) {
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

export const DELETE_DISEASE = gql`
  mutation($id: ID!) {
    deleteDisease(id: $id) {
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

export const CREATE_SYMPTOM = gql`
  mutation($name: String!) {
    createSymptom(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_SYMPTOM = gql`
  mutation($id: ID!, $name: String!) {
    updateSymptom(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_SYMPTOM = gql`
  mutation($id: ID!) {
    deleteSymptom(id: $id) {
      id
      name
    }
  }
`;
