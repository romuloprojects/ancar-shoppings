export interface ShoppingLocationMaster {
  city: string;
  state: string;
  stateCode: string;
  latitude: number;
  longitude: number;
}

// Cadastro geográfico estável do portfólio ANCAR.
// É usado apenas como fallback quando a API ainda não possui metadados de localização.
// Os dados operacionais continuam vindo exclusivamente da API/n8n.
export const SHOPPING_LOCATIONS: Record<string, ShoppingLocationMaster> = {
  BAN: { city: "Campinas", state: "São Paulo", stateCode: "SP", latitude: -22.925, longitude: -47.1264 },
  BLD: { city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", latitude: -22.9068, longitude: -43.1729 },
  BPS: { city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", latitude: -22.9519, longitude: -43.1808 },
  CVS: { city: "São José dos Campos", state: "São Paulo", stateCode: "SP", latitude: -23.2237, longitude: -45.9009 },
  GOL: { city: "São Bernardo do Campo", state: "São Paulo", stateCode: "SP", latitude: -23.683496, longitude: -46.557354 },
  ITA: { city: "São Paulo", state: "São Paulo", stateCode: "SP", latitude: -23.5405, longitude: -46.4602 },
  MAD: { city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", latitude: -22.8759, longitude: -43.3382 },
  NAT: { city: "Natal", state: "Rio Grande do Norte", stateCode: "RN", latitude: -5.8306, longitude: -35.2028 },
  NSF: { city: "Fortaleza", state: "Ceará", stateCode: "CE", latitude: -3.7436, longitude: -38.5267 },
  NSJ: { city: "Fortaleza", state: "Ceará", stateCode: "CE", latitude: -3.7772, longitude: -38.548 },
  NSM: { city: "Maracanaú", state: "Ceará", stateCode: "CE", latitude: -3.8767, longitude: -38.6256 },
  PAN: { city: "Cuiabá", state: "Mato Grosso", stateCode: "MT", latitude: -15.5989, longitude: -56.0949 },
  PVS: { city: "Porto Velho", state: "Rondônia", stateCode: "RO", latitude: -8.7619, longitude: -63.9039 },
  RDB: { city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", latitude: -23.0021, longitude: -43.3186 },
  SNA: { city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", latitude: -22.883, longitude: -43.306 },
  SNI: { city: "Nova Iguaçu", state: "Rio de Janeiro", stateCode: "RJ", latitude: -22.7592, longitude: -43.4511 },
  VSS: { city: "Fortaleza", state: "Ceará", stateCode: "CE", latitude: -3.85, longitude: -38.55 },
};
