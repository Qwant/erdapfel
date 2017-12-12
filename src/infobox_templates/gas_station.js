function GazStation(gazStationData) {
  if(gazStationData) {
    return `
      <h1>${gazStationData.name}</h1>
    `
  } else {
    return `
      <h2>'Error loading data'</h2>
    `
  }
}

export default GazStation
