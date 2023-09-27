import insert from "../utils/insert.json" assert { type: "json" };
import { API_URL } from "./config.js";
import API from "../utils/axiosSetup.js";

const problemContent = document.querySelector(insert?.problemContent);
const fixContent = document.querySelector(insert?.fixContent);
const detailContent = document.querySelector(insert?.detailContent);
const causesContent = document.querySelector(insert?.causesContent);
const repairContent = document.querySelector(insert?.repairContent);
const errorTitles = document.querySelectorAll(insert?.errorTitles);
const headTitle = document.querySelector(insert?.headTitle);
const loaders = document.querySelectorAll(".loading");

let defaultLanguage;
const params = new URLSearchParams(window.location.search);
const errName = params.get("err");
let alertError = true;
// Flag to track if getGptKnown has been called
let getGptKnownCalled = false;
// Promise to resolve when getGptKnown is fetched
let getGptKnownPromise;

function defaultText(domEl) {
  if (domEl) {
    switch (domEl) {
      case detailContent:
        detailContent.innerHTML = `<p style="margin-bottom: 8px">
                A
                <span class="getParam capitalize" data-key="file">PC</span>
                error can exist if one or more of the following symptoms appear:
              </p>
              <ul class="bullets">
                <li>
                  <strong
                    >Freezing (so-called “Freeze”) of the application or the
                    entire system.</strong
                  >
                  This means that neither your application nor the operating
                  system reacts to your mouse clicks or other commands. The
                  freeze is usually only short-lived before your system goes
                  back to normal operation.
                </li>
                <li>
                  <strong
                    >Application crashes or the entire system crashes.</strong
                  >
                  The application or the operating system does not respond to
                  any of your commands and you have no way of restoring normal
                  operation. All that remains is to close the application or
                  reboot your system.
                </li>
                <li>
                  <strong
                    >Your system reboots randomly and without your
                    prompting</strong
                  >
                </li>
                <li>
                  <strong>Problems installing or uninstalling software</strong>
                </li>
                <li>
                  <strong>Connection problems</strong> which you cannot solve,
                  even by adjusting the network settings.
                </li>
                <li>
                  <strong>Other error messages</strong> or a BSOD (so-called
                  "blue death"/"blue screen of death" and "stop errors")
                </li>
              </ul>`;
        break;
      case causesContent:
        causesContent.innerHTML = `<p style="margin-bottom: 8px">This error can be caused by:</p>
              <ul class="bullets">
                <li>
                  Entries in the registry (left over from various applications)
                  are corrupted and invalid.
                </li>
                <li>Operating system or software malfunctions</li>
                <li>Incompatibility of installed programs</li>
                <li>Errors in application source code</li>
              </ul>
              <p>
                There are a number of factors that can cause problems. If, for
                example, a PC is switched off while a Windows update is being
                carried out, system files are moved to the hard disk, or
                application processes are abruptly terminated. Virus and malware
                attacks can also cause computer problems, as can manual changes
                in the registry or poor software uninstallations by
                inexperienced users.
              </p>`;
        break;
      case repairContent:
        repairContent.innerHTML = `<p>
                If you have broad computer knowledge, you could fix
                <span class="os_name">Windows</span> problems yourself by
                modifying the registry, removing keycodes that are invalid or
                corrupted, and making other manual changes to fix and remove
                <span class="getParam capitalize" data-key="file">PC</span>
                errors.
              </p>
              <p>
                However, manual interventions in the registry is always
                associated with the risk that the operating system may no longer
                be bootable due to these changes. So if you are unsure of your
                abilities, you should use specially developed software that
                guarantees safe repairs and does not require any special
                knowledge for the treatment of computer or system errors.
              </p>`;
        break;
      default:
        break;
    }
  } else {
    detailContent.innerHTML = `<p style="margin-bottom: 8px">
                A
                <span class="getParam capitalize" data-key="file">PC</span>
                error can exist if one or more of the following symptoms appear:
              </p>
              <ul class="bullets">
                <li>
                  <strong
                    >Freezing (so-called “Freeze”) of the application or the
                    entire system.</strong
                  >
                  This means that neither your application nor the operating
                  system reacts to your mouse clicks or other commands. The
                  freeze is usually only short-lived before your system goes
                  back to normal operation.
                </li>
                <li>
                  <strong
                    >Application crashes or the entire system crashes.</strong
                  >
                  The application or the operating system does not respond to
                  any of your commands and you have no way of restoring normal
                  operation. All that remains is to close the application or
                  reboot your system.
                </li>
                <li>
                  <strong
                    >Your system reboots randomly and without your
                    prompting</strong
                  >
                </li>
                <li>
                  <strong>Problems installing or uninstalling software</strong>
                </li>
                <li>
                  <strong>Connection problems</strong> which you cannot solve,
                  even by adjusting the network settings.
                </li>
                <li>
                  <strong>Other error messages</strong> or a BSOD (so-called
                  "blue death"/"blue screen of death" and "stop errors")
                </li>
              </ul>`;
    causesContent.innerHTML = `<p style="margin-bottom: 8px">This error can be caused by:</p>
              <ul class="bullets">
                <li>
                  Entries in the registry (left over from various applications)
                  are corrupted and invalid.
                </li>
                <li>Operating system or software malfunctions</li>
                <li>Incompatibility of installed programs</li>
                <li>Errors in application source code</li>
              </ul>
              <p>
                There are a number of factors that can cause problems. If, for
                example, a PC is switched off while a Windows update is being
                carried out, system files are moved to the hard disk, or
                application processes are abruptly terminated. Virus and malware
                attacks can also cause computer problems, as can manual changes
                in the registry or poor software uninstallations by
                inexperienced users.
              </p>`;
    repairContent.innerHTML = `<p>
                If you have broad computer knowledge, you could fix
                <span class="os_name">Windows</span> problems yourself by
                modifying the registry, removing keycodes that are invalid or
                corrupted, and making other manual changes to fix and remove
                <span class="getParam capitalize" data-key="file">PC</span>
                errors.
              </p>
              <p>
                However, manual interventions in the registry is always
                associated with the risk that the operating system may no longer
                be bootable due to these changes. So if you are unsure of your
                abilities, you should use specially developed software that
                guarantees safe repairs and does not require any special
                knowledge for the treatment of computer or system errors.
              </p>`;
  }
}

function generateMarkup(data, domEl) {
  domEl.innerHTML = "";
  const p = document.createElement("p");
  p.style.marginBottom = "8px";
  p.innerText = data;
  if (domEl === fixContent) {
    const a = document.createElement("a");
    a.href = "https://windowstechies.com/go/fortect-repairtool/";
    a.classList.add("xid");
    a.innerText = "Click here to download.";
    a.style.marginLeft = "5px";
    p.appendChild(a);
  }
  domEl.appendChild(p);
}

async function uploadJsonFile(errName, lang, key, data, promptId) {
  try {
    await API.post(
      `${API_URL}prompt/s3?err=${errName}&lang=${lang}&promptId=${promptId}`,
      {
        [key]: data,
      }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getJsonFile(errName, lang, promptId) {
  try {
    let { data } = await API.get(
      `${API_URL}prompt/s3?err=${errName}&lang=${lang}&promptId=${promptId}`
    );

    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getAnswer(errName, lang, promptId, domEl) {
  try {
    if (domEl) {
      domEl.classList.add("loading");
    }
    let { data } = await API.post(
      `${API_URL}prompt?err=${errName}&lang=${lang}`,
      {
        templateId: promptId,
      }
    );
    const result = data?.data;

    if (result && promptId !== "31c62f83-f14d-4ff8-9aa2-f925e4e26fb3") {
      if (promptId === "f2fca36a-228f-41c1-bb52-828e2796fe8d") {
        domEl.innerText = result.replaceAll('"', "");
      } else {
        generateMarkup(result, domEl);
      }
    } else {
      return result;
    }
    domEl.classList.remove("loading");
    domEl.classList.add("px");
    return result;
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
      if (errName) {
        main(errName, data, prompts);
      }
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

async function getGptKnown(errName, lang) {
  try {
    let gptKnown;
    const response = await getAnswer(
      errName,
      lang,
      "31c62f83-f14d-4ff8-9aa2-f925e4e26fb3"
    );
    gptKnown = response.toLowerCase();

    return gptKnown;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Function to fetch gptKnown, ensures it's called only once
function fetchGptKnown(errName, lang) {
  try {
    if (!getGptKnownCalled) {
      getGptKnownCalled = true;
      getGptKnownPromise = getGptKnown(errName, lang);
    }
    return getGptKnownPromise;
  } catch (error) {
    console.log(error, "fetch gpt known");
    throw error;
  }
}

async function init(errName, lang, domEl, promptId, key) {
  try {
    let data = await getJsonFile(errName, lang, promptId);
    const result = data?.data;

    if (Object.keys(result).length > 0) {
      const key = Object.keys(result)[0];
      domEl.classList.remove("loading");
      domEl.classList.add("px");
      if (key === "headtitle") {
        headTitle.innerText = result.headtitle;
      }

      generateMarkup(Object.values(result)[0], domEl);
    } else {
      let gptKnown = await fetchGptKnown(errName, lang);
      if (gptKnown === "yes" || gptKnown === "yes.") {
        const data = await getAnswer(errName, lang, promptId, domEl);

        if (data) {
          await uploadJsonFile(errName, lang, key, data, promptId);
        }
      } else {
        domEl.classList.remove("loading");
        domEl.classList.add("px");
        defaultText(domEl);
      }
    }
  } catch (error) {
    console.log(error, "error init");
    console.log(error.message, "error.message");
    if (error?.response?.status === 429 && alertError) {
      alertError = false;
      alert(error?.response?.data?.message);
    }
    domEl.classList.remove("loading");
    domEl.classList.add("px");
    defaultText(domEl);
    throw error;
  }
}

async function main(errName, defaultLanguage, prompts) {
  try {
    if (prompts.length > 0) {
      for (let i = 0; i < prompts.length; i++) {
        init(
          errName,
          defaultLanguage,
          prompts[i].domElement,
          prompts[i].promptId,
          prompts[i].key
        );
      }
      errorTitles.forEach((errorTitle) => {
        errorTitle.textContent = errName.replace("error", "");
      });
    }
  } catch (error) {
    console.log(error, "main error");
  }
}

const prompts = [
  {
    promptId: "f2fca36a-228f-41c1-bb52-828e2796fe8d",
    domElement: headTitle,
    key: "headtitle",
  },
  {
    promptId: "228c1338-5dd9-44c3-8f44-f56b2a0b8cf4",
    domElement: problemContent,
    key: "whatsproblem",
  },
  {
    promptId: "bd9682c1-b7d2-4d17-9200-fad290d5be4b",
    domElement: fixContent,
    key: "howtofix",
  },
  {
    promptId: "ed7bc3bc-c29e-4299-882b-6c991dbb5028",
    domElement: detailContent,
    key: "givedetails",
  },
  {
    promptId: "4782bdd8-56ff-4bf3-9715-bd5e63513f50",
    domElement: causesContent,
    key: "whatcauses",
  },
  {
    promptId: "f58dcdb1-fecc-4ae5-a6d4-4b960dcb1b81",
    domElement: repairContent,
    key: "howtorepair",
  },
];

if (errName) {
  main(errName, defaultLanguage, prompts);
} else {
  loaders.forEach((loader) => {
    loader.classList.remove("loading");
    loader.classList.add("px");
  });
  defaultText();
}
