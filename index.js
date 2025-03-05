function generateInputs() {
  let n = document.getElementById("numPoints").value;
  let container = document.getElementById("inputContainer");
  container.innerHTML = "";

  for (let i = 0; i < n; i++) {
    let div = document.createElement("div");
    div.classList.add("input-group");
    div.innerHTML = `
            x${i + 1}: <input type="text" id="x${i}"> 
            y${i + 1}: <input type="text" id="y${i}">
        `;
    container.appendChild(div);
  }
  let formula = `P(x) = \\sum_{i=0}^{${
    points.length - 1
  }} y_i \\prod_{\\substack{j=0 \\\\ j\\neq i}}^{${
    points.length - 1
  }} \\frac{x - x_j}{x_i - x_j}`;

  document.getElementById(
    "specificFormula"
  ).innerHTML = `$$ \\begin{aligned} ${formula} \\end{aligned} $$`;

  MathJax.typesetPromise(); // Re-render MathJax
}

function evaluateExpression(expression) {
  try {
    return Function(`"use strict"; return (${expression})`)();
  } catch (error) {
    return NaN;
  }
}

function getPoints(n) {
  let points = [];
  let xValues = new Set();
  for (let i = 0; i < n; i++) {
    let x = evaluateExpression(document.getElementById(`x${i}`).value);
    let y = evaluateExpression(document.getElementById(`y${i}`).value);
    if (isNaN(x) || isNaN(y)) {
      alert(
        "Invalid input detected! Ensure all fields contain valid mathematical expressions."
      );
      return null;
    }
    if (xValues.has(x)) {
      alert("Duplicate x values detected! Please enter unique x values.");
      return null;
    }
    xValues.add(x);
    points.push({ x, y });
  }
  return points;
}

function generateSpecificFormula(points) {
  let formula = "P(x) = ";
  let terms = [];

  for (let i = 0; i < points.length; i++) {
    let term = `y_{${i + 1}} \\cdot \\left(`;
    let subTerms = [];

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        subTerms.push(
          `\\frac{x - x_${j}}{x_${i} - x_${j}}`
        );
      }
    }

    term += subTerms.join(" \\cdot ") + "\\right)";
    terms.push(term);
  }

  formula += terms.join(" + ");
  document.getElementById("specificFormula").innerHTML = `$$ ${formula} $$`;
  MathJax.typesetPromise();
}

function lagrangeInterpolation(points, x) {
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    let term = points[i].y;
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        let denominator = points[i].x - points[j].x;
        if (denominator === 0) return NaN;
        term *= (x - points[j].x) / denominator;
      }
    }
    result += term;
  }
  return result;
}

function calculateLagrange() {
  let n = document.getElementById("numPoints").value;
  let points = getPoints(n);
  if (!points) return;

  generateSpecificFormula(points); // Generate the specific Lagrange formula

  let xValue = evaluateExpression(prompt("Enter x value to interpolate:"));
  if (isNaN(xValue)) {
    alert("Invalid x value! Please enter a valid expression.");
    return;
  }

  let result = lagrangeInterpolation(points, xValue);
  if (isNaN(result)) {
    document.getElementById("result").innerText = "Error in calculation!";
  } else {
    document.getElementById(
      "result"
    ).innerText = `P(${xValue}) = ${result.toFixed(5)}`;
  }
}
