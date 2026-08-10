declare module "naija-state-local-government" {
  interface StateData {
    state: string;
    senatorial_districts: string[];
    lgas: string[];
  }
  const NaijaStates: {
    all: () => StateData[];
    states: () => string[];
    senatorial_districts: (state: string) => string[];
    lgas: (state: string) => StateData;
  };
  export default NaijaStates;
}
