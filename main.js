// Grabbing the form and building elements from the HTML
const userInput = document.querySelector(".user_input");
const userForm = document.getElementById("user_form");
const building = document.querySelector(".building");

// Variables to store the total number of lifts and floors
let totalLifts = 0;
let totalFloors = 0;
let pendingRequests = []; // Queue for pending floor requests
let isLiftMoving = []; // Array to track moving status of lifts

// Event listener for form submission
userForm.addEventListener("submit", validateUserForm);

function validateUserForm(event) {
  event.preventDefault();

  const liftCount = +document.querySelector("#totalLifts").value;
  const floorCount = +document.querySelector("#totalFloors").value;

  if (liftCount <= 0) {
    alert("Number of lifts should be greater than 0");
  } else if (floorCount <= 0) {
    alert("Number of floors should be greater than 0");
  } else {
    building.innerHTML = ""; // Clear the building area
    totalFloors = floorCount;
    totalLifts = liftCount;

    userInput.style.display = "none"; // Hide the input form

    generateFloors();
    generateLifts();
  }
}

function generateFloors() {
  for (let i = totalFloors; i >= 1; i--) {
    const floorDiv = document.createElement("div");
    const btnsDiv = document.createElement("div");
    const upBtn = document.createElement("button");
    const downBtn = document.createElement("button");

    floorDiv.className = `floor_container`;
    floorDiv.textContent = `Floor ${i}`;
    btnsDiv.className = `floor_btns-container`;

    upBtn.className = `btn`;
    upBtn.textContent = "UP";
    downBtn.className = `btn`;
    downBtn.textContent = "DOWN";

    upBtn.addEventListener("click", () => handleButtonClick(i, 'up'));
    downBtn.addEventListener("click", () => handleButtonClick(i, 'down'));

    if (i === totalFloors) upBtn.style.display = 'none';
    if (i === 1) downBtn.style.display = 'none';

    floorDiv.setAttribute("floor-id", i);
    upBtn.setAttribute("floor-id", i);
    downBtn.setAttribute("floor-id", i);

    btnsDiv.append(upBtn, downBtn);
    floorDiv.append(btnsDiv);
    building.append(floorDiv);
  }
}

function generateLifts() {
  const firstFloor = document.querySelector('[floor-id="1"]');
  
  for (let i = 0; i < totalLifts; i++) {
    let liftContainer = document.createElement("div");
    liftContainer.className = "lift";
    liftContainer.id = `lift${i}`;
    
    const liftDoors = document.createElement("div");
    liftDoors.className = "lift_doors-container";
    const liftLeftDoor = document.createElement("div");
    const liftRightDoor = document.createElement("div");

    liftLeftDoor.className = "left-door";
    liftRightDoor.className = "right-door";

    liftDoors.append(liftLeftDoor, liftRightDoor);
    liftContainer.append(liftDoors);

    firstFloor.append(liftContainer);
    isLiftMoving[i] = false;
  }
}

function handleButtonClick(floor, direction) {
  const availableLift = getNearestAvailableLift(floor);

  if (availableLift) {
    moveLift(availableLift, floor);
  } else {
    pendingRequests.push({ floor, direction });
  }
}

function getNearestAvailableLift(requestedFloor) {
  const allLifts = document.querySelectorAll(".lift");
  let nearestLift = null;
  let minDistance = Infinity;

  allLifts.forEach((lift, index) => {
    if (!isLiftMoving[index]) {
      const currentFloor = Math.abs(parseInt(lift.style.transform.split("(")[1]) || 0) / 10 + 1;
      const distance = Math.abs(requestedFloor - currentFloor);

      if (distance < minDistance && !isLiftAlreadyPresent(requestedFloor)) {
        minDistance = distance;
        nearestLift = { liftElement: lift, liftId: index };
      }
    }
  });

  return nearestLift;
}

function isLiftAlreadyPresent(floor) {
  const allLifts = document.querySelectorAll(".lift");
  const targetPosition = -(floor - 1) * 10; 

  return Array.from(allLifts).some(lift => lift.style.transform === `translateY(${targetPosition}rem)`);
}

function moveLift(liftInfo, destinationFloor) {
  const { liftElement, liftId } = liftInfo;
  const currentFloor = Math.abs(parseInt(liftElement.style.transform.split("(")[1]) || 0) / 10 + 1;
  const floorsToMove = Math.abs(destinationFloor - currentFloor);

  const transitionTime = floorsToMove * 2; // 2 seconds per floor
  const height = -(destinationFloor - 1) * 10;

  isLiftMoving[liftId] = true;
  liftElement.style.transition = `transform ${transitionTime}s ease-in-out`;
  liftElement.style.transform = `translateY(${height}rem)`;

  setTimeout(() => {
    openLiftDoors(liftElement);

    setTimeout(() => {
      closeLiftDoors(liftElement);

      setTimeout(() => {
        if (pendingRequests.length > 0) {
          const nextRequest = pendingRequests.shift();
          moveLift(liftInfo, nextRequest.floor);
        } else {
          isLiftMoving[liftId] = false;
        }
      }, 2500);
    }, 2500);
  }, transitionTime * 1000);
}

function openLiftDoors(liftElement) {
  const liftDoors = liftElement.querySelector(".lift_doors-container");
  liftDoors.classList.add("openLift");
  liftDoors.classList.remove("closeLift");
}

function closeLiftDoors(liftElement) {
  const liftDoors = liftElement.querySelector(".lift_doors-container");
  liftDoors.classList.add("closeLift");
  liftDoors.classList.remove("openLift");
}
