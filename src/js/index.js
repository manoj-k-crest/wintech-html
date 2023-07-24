import insert from "../utils/insert.json" assert { type: "json" };
import { API_URL } from "./config.js";
const problemContent = document.querySelector(insert?.problemContent);
const fixContent = document.querySelector(insert?.fixContent);
const detailContent = document.querySelector(insert?.detailContent);
const causesContent = document.querySelector(insert?.causesContent);
const repairContent = document.querySelector(insert?.repairContent);
const errorTitles = document.querySelectorAll(insert?.errorTitles);
const headTitle = document.querySelector(insert?.headTitle);
const loader = document.querySelector(".loading");
let defaultLanguage;

function generateMarkup(data, parentEl) {
  parentEl.innerHTML = "";
  const p = document.createElement("p");
  p.style.marginBottom = "8px";
  p.innerText = data;
  if(parentEl === fixContent) {
    const a = document.createElement("a");
    a.href = "https://windowstechies.com/go/fortect-repairtool/";
    a.classList.add("xid");
    a.innerText = "Click here to download.";
    a.style.marginLeft = "5px"
    p.appendChild(a)
  }
  parentEl.appendChild(p);
}

const params = new URLSearchParams(window.location.search);
const errName = params.get("err");

async function getAnswer(errName, lang) {
  try {
    loader.classList.remove("hide");
    loader.classList.add("show");
    let data = await fetch(`${API_URL}prompt?err=${errName}&lang=${lang}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data: result } = await data.json();
    if (result) {
      headTitle.innerText = result.headtitle;
      errorTitles.forEach((errorTitle) => {
        errorTitle.textContent = errName.replace("error", "");
      });
      generateMarkup(result.whatsproblem, problemContent);
      generateMarkup(result.howtofix, fixContent);
      generateMarkup(result.givedetails, detailContent);
      generateMarkup(result.whatcauses, causesContent);
      generateMarkup(result.howtorepair, repairContent);
    }
    loader.classList.remove("show");
    loader.classList.add("hide");
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const elSelectCustoms = document.querySelectorAll(".js-selectCustom");
elSelectCustoms.forEach((elSelectCustom) => {
  const elSelectCustomValue = elSelectCustom.children[0];
  const elSelectCustomOptions = elSelectCustom.children[1];
  defaultLanguage = elSelectCustomValue.getAttribute("data-value");
  const inpuLanguage = document.getElementById("language");
  Array.from(elSelectCustomOptions.children).forEach(function (elOption) {
    elOption.addEventListener("click", (e) => {
      elSelectCustomValue.innerHTML = e.target.innerHTML;
      elSelectCustom.classList.remove("isActive");
      const data = elOption.getAttribute("data-value");
      inpuLanguage.value = data;
      getAnswer(errName, data);
    });
  });
  elSelectCustomValue.addEventListener("click", (e) => {
    elSelectCustom.classList.toggle("isActive");
  });
  document.addEventListener("click", (e) => {
    const didClickedOutside = !elSelectCustom.contains(event.target);
    if (didClickedOutside) {
      elSelectCustom.classList.remove("isActive");
    }
  });
});

if (errName) {
  getAnswer(errName, defaultLanguage);
} else {
  loader.classList.add("hide");
}
