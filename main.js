// Grabbing the form and building elements from the HTML
const userInput = document.querySelector(".user_input");
const userForm = document.getElementById("user_form");
const building = document.querySelector(".building");

let totalLifts = 0;
let totalFloors = 0;
let pendingFloors = []; 
let isLiftMoving = [];

userForm.addEventListener("submit", validateUserForm);

function validateUserForm(event) {
  event.preventDefault();

  const liftCount = +document.querySelector("#totalLifts").value;
  const floorCount = +document.querySelector("#totalFloors").value;

  if (liftCount <= 0) {
    alert("No. of lifts should be greater than 0");
  } else if (floorCount <= 0) {
    alert("No. of Floors should be greater than 0");
  } else if (floorCount > 9999) {
    alert("App will crash if the no. of floors is more than 9999");
  } else if (liftCount > floorCount) {
    alert("No. of lifts should be lesser than or equal to No. of Floors");
  } else {
    building.innerHTML = ""; 
    totalFloors = floorCount;
    totalLifts = liftCount;

    userInput.style.display = "none"; 

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

    upBtn.addEventListener("click", buttonClickHandler);
    downBtn.addEventListener("click", buttonClickHandler);

    if (i === totalFloors) {
      upBtn.style.display = 'none';
    } else if (i === 1) {
      downBtn.style.display = 'none';
    }

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

    const liftDoors = document.createElement("div");
    liftDoors.className = "lift_doors-container";
    const liftLeftDoor = document.createElement("div");
    const liftRightDoor = document.createElement("div");

    liftLeftDoor.className = "left-door";
    liftRightDoor.className = "right-door";

    liftContainer.id = `lift${i}`;

    liftDoors.append(liftLeftDoor, liftRightDoor);
    liftContainer.append(liftDoors);

    firstFloor.append(liftContainer);
    isLiftMoving[i] = false;
  }
}

// This function will handle button clicks for both up and down buttons
function buttonClickHandler(event) {
  const element = event.target; // The button that was clicked
  const destinationFloor = Number(element.getAttribute("floor-id")); // Get the floor number where the button was clicked

  // Check if the button is currently processing a request
  if (element.getAttribute("processing")) {
    return; // If a request is being processed, ignore further clicks
  }

  element.setAttribute("processing", "true"); // Mark the button as being processed

  // Process the first request
  const availableLift = getAvailableLift(destinationFloor);
  if (availableLift) {
    moveLift(availableLift, destinationFloor);
  } else {
    pendingFloors.push(destinationFloor); // If no lifts are available, add to pending queue
  }

  // Wait for 2 seconds before allowing the button to process another request
  setTimeout(() => {
    element.removeAttribute("processing"); // Allow new requests after 2 seconds
  }, 2000); // 2000 milliseconds = 2 seconds
}


function getAvailableLift(destinationFloor) {
  const allLiftElements = document.querySelectorAll(".lift");
  let nearestLift = null;
  let minDistance = Infinity;

  allLiftElements.forEach((lift, index) => {
    if (!isLiftMoving[index]) {
      const currentFloor = Math.abs(parseInt(lift.style.transform.split("(")[1]) || 0) / 10 + 1;
      const distance = Math.abs(destinationFloor - currentFloor);

      if (distance < minDistance) {
        minDistance = distance;
        nearestLift = { liftElement: lift, liftId: index };
      }
    }
  });

  return nearestLift;
}

function moveLift(liftInfo, destinationFloor) {
  const { liftElement, liftId } = liftInfo;
  const currentFloor = Math.abs(parseInt(liftElement.style.transform.split("(")[1]) || 0) / 10 + 1;
  const floorsToMove = Math.abs(destinationFloor - currentFloor);

  const transitionTime = floorsToMove * 2; 
  const height = -(destinationFloor - 1) * 10;

  isLiftMoving[liftId] = true;
  liftElement.style.transition = `transform ${transitionTime}s ease-in-out`;
  liftElement.style.transform = `translateY(${height}rem)`;

  setTimeout(() => {
    openLiftDoors(liftElement);

    setTimeout(() => {
      closeLiftDoors(liftElement);

      setTimeout(() => {
        if (pendingFloors.length > 0) {
          const nextFloor = pendingFloors.shift();
          moveLift(liftInfo, nextFloor);
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

function checkIsLiftAlreadyPresent(destinationFloor) {
  const allLiftElements = document.querySelectorAll(".lift");
  const height = -(destinationFloor - 1) * 10;

  for (const lift of allLiftElements) {
    if (lift.style.transform == `translateY(${height}rem)`) {
      let liftName = lift.id;
      let liftId = Number(liftName.replace(/\D/g, ""));
      return { liftElement: lift, liftId };
    }
  }

  return { liftElement: null, liftId: null };
}
