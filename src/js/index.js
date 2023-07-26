import insert from "../utils/insert.json" assert { type: "json" };
import { API_URL } from "./config.js";
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

function generateMarkup(data, parentEl) {
  parentEl.innerHTML = "";
  const p = document.createElement("p");
  p.style.marginBottom = "8px";
  p.innerText = data;
  if (parentEl === fixContent) {
    const a = document.createElement("a");
    a.href = "https://windowstechies.com/go/fortect-repairtool/";
    a.classList.add("xid");
    a.innerText = "Click here to download.";
    a.style.marginLeft = "5px";
    p.appendChild(a);
  }
  parentEl.appendChild(p);
}

async function uploadJsonFile(errName, lang) {
  try {
    await fetch(`${API_URL}prompt/s3?err=${errName}&lang=${lang}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headtitle: headTitle.innerText,
        whatsproblem: problemContent.innerText,
        howtofix: fixContent.innerText,
        givedetails: detailContent.innerText,
        whatcauses: causesContent.innerText,
        howtorepair: repairContent.innerText,
      }),
    });
  } catch (err) {
    console.log(err);
    throw err
  }
}

async function getAnswer(errName, lang, templateName, domEl) {
  try {
    let domElement;
    if (domEl) {
      domElement = document.querySelector(domEl);
      domElement.classList.add("loading");
    }
    let data = await fetch(`${API_URL}prompt?err=${errName}&lang=${lang}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateName: templateName,
      }),
    });
    const { data: result } = await data.json();
    if (result && templateName !== "Check") {
      if (templateName === "Headtitle") {
        domElement.innerText = result.replaceAll('"', "");
      } else {
        generateMarkup(result, domElement);
      }
    } else if(result === undefined && data.status === 429) {
      throw new Error(
        "Too many requests from your IP, please try again after an hour"
      );
    } else{
      return result;
    }
    domElement.classList.remove("loading");
  } catch (err) {
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
        init(errName, data);
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

async function init(errName, lang) {
  try {
    let data = await fetch(`${API_URL}prompt/s3?err=${errName}&lang=${lang}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data: result } = await data.json();
    if (Object.keys(result).length > 0) {
      loaders.forEach((loader) => loader.classList.remove("loading"));
      headTitle.innerText = result.headtitle;
      errorTitles.forEach((errorTitle) => {
        errorTitle.textContent = errName.replace("error", "");
      });
      generateMarkup(result.whatsproblem, problemContent);
      generateMarkup(result.howtofix, fixContent);
      generateMarkup(result.givedetails, detailContent);
      generateMarkup(result.whatcauses, causesContent);
      generateMarkup(result.howtorepair, repairContent);
    } else {
      const gptKnown = await getAnswer(errName, lang, "Check");
      if (
        gptKnown.toLowerCase() === "yes" ||
        gptKnown.toLowerCase() === "yes."
      ) {
        const promptResponses = await Promise.all([
          getAnswer(errName, lang, "Headtitle", "#headtitle"),
          getAnswer(errName, lang, "Problem", "#whatsproblem"),
          getAnswer(errName, lang, "Fix", "#howtofix"),
          getAnswer(errName, lang, "Detail", "#givedetails"),
          getAnswer(errName, lang, "Causes", "#whatcauses"),
          getAnswer(errName, lang, "Repair", "#howtorepair"),
        ]);
        if (promptResponses) {
          await uploadJsonFile(errName, lang);
        }
      } else {
        loaders.forEach((loader) => loader.classList.remove("loading"));
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
  } catch (error) {
   alert(error);
   loaders.forEach((loader) => loader.classList.remove("loading"));
  }
}

if (errName) {
  init(errName, defaultLanguage);
} else {
  loaders.forEach((loader) => loader.classList.remove("loading"));
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
