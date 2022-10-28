const express = require("express");

const path = require("path");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeBbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3003, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializeBbAndServer();

const convertStateObjectToResponse = (state) => {
  return {
    stateId: state.state_id,
    stateName: state.state_name,
    population: state.population,
  };
};

const convertDistrictObjectToResponse = (district) => {
  return {
    districtId: district.district_id,
    districtName: district.district_name,
    stateId: district.state_id,
    cases: district.cases,
    cured: district.cured,
    active: district.active,
    deaths: district.deaths,
  };
};

//API 1
//GET ALL STATES
app.get("/states/", async (request, response) => {
  const getAllStates = `
    SELECT 
    * FROM
    state;`;
  const stateArray = await db.all(getAllStates);
  response.send(
    getAllStates.map((eachState) => convertStateObjectToResponse(eachState))
  );
});

//API 2
//GET STATE BASED ON ID
app.get("/states/:stateId/", async (request, response) => {
  const getState = `
    SELECT * FROM state
    WHERE state_id=${stateId};`;
  const state = await db.get(getState);
  response.send(convertStateObjectToResponse(state));
});

//API 3
//CREATE STATE
app.post("/districts/", async (request, response) => {
  const {
    districtId,
    districtName,
    stateId,
    cured,
    cases,
    active,
  } = request.body;
  const createDistrict = `
    INSERT INTO 
    district(district_name,state_id,cured,cases,active)
    VALUES(
        '${districtName}',
        '${stateId}',
        '${cured}',
        '${cases}',
        '${active}'
    );`;

  const addDistrict = await db.run(createDistrict);
  response.send("District Successfully Added");
});

//API 4
//GET DISTRICT BASED ON ID
app.get("/districts/:districtId/", async (request, response) => {
  const getDistrict = `
    SELECT * FROM
    district 
    WHERE 
    district_id=${districtId};`;

  const district = await db.get(getDistrict);
  response.send(convertDistrictObjectToResponse(district));
});

//API 5
//DELETE DISTRICT
app.delete("/districts/:districtId/", async (request, response) => {
  const deleteDistrict = `
    DELETE FROM district
    WHERE district_id=${districtId};`;

  const deleted = await db.get(deleteDistrict);
  response.send("District Removed");
});

//API 6
//UPDATE DISTRICT

app.put("/districts/:districtId/", async (request, response) => {
  const {
    districtName,
    stateId,
    cured,
    cases,
    active,
    deaths,
  } = request.params;
  const updateDistrict = `
    UPDATE district
    SET district_name=${districtName},
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths},
    WHERE 
    district_id=${districtId};`;

  const updatedDistrict = await db.run(updateDistrict);
  response.send("District Details Updated");
});

//API 7
//GET STATISTICS OF STATE
app.get("/states/:stateId/stats/", async (request, response) => {
  const getStatistics = `SELECT 
    COUNT(cases) AS totalCases,
    COUNT(cured) AS totalCured,
    COUNT(active) AS totalActive,
    COUNT(deaths) AS totalDeaths,
     FROM 
    district
    WHERE
    state_id=${stateId};`;
  const getTotalStatistics = await db.get(getStatistics);
  response.send(convertDistrictObjectToResponse(getTotalStatistics));
});

//API 8
//GET STATE NAME
app.get("/districts/:districtId/details/", async (request, response) => {
  const getStateNameDistrict = `
    SELECT stateName FROM state
    INNER JOIN district 
    ON state.state_id=district.state_id;`;
  const stateName = await db.get(getStateNameDistrict);
  response.send(convertStateObjectToResponse(stateName));
});

module.exports = app;
