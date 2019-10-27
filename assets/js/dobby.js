/*
    Dobby Google API Wrapper

    This is a wrapper for Google API created and used in Dobby Co., Ltd.
    All the documents need to be published as web in public.

    Written by Juan Lee (juanlee@kaist.ac.kr)
    version: dobby.dev.0.1
*/

$("#btn-refresh").click(() => {
  localStorage.clear();
  location.reload();
});

/**************************************************/
// Sheet

const readSheet = async sheetId => {
  let sheet = 1;
  sheets = {};

  try {
    // retrieve all sheets until not exist
    while (true) {
      const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheet}/public/values?alt=json`;
      const data = await $.getJSON(url, data => {
        return data;
      });

      sheets[data.feed.title.$t] = data.feed.entry.map(entry => {
        const colnames = Object.keys(entry)
          .filter(col => col.startsWith("gsx"))
          .map(col => col.slice(4));

        let parsed = {};
        colnames.forEach(col => {
          parsed[col] = entry["gsx$" + col].$t;
        });
        return parsed;
      });

      sheet += 1;
    }
  } catch (error) {}

  return sheets;
};

/**************************************************/
// Time

let remainingTime = () => {
  let end = new Date();
  end.setHours(24, 0, 0, 0);
  let diff = new Date(end - Date.now());

  return `${String(diff.getHours()).padStart(2, "0")}:${String(
    diff.getMinutes()
  ).padStart(2, "0")}:${String(diff.getSeconds()).padStart(2, "0")}`;
};

let remainingDate = () => {
  let tmp_info = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  let tmp_date = new Date(tmp_info);
  tmp_date.setDate(1);
  tmp_date.setMonth(tmp_date.getMonth() + 1);
  tmp_date.setDate(0);

  const last_date = tmp_date.getDate();
  const today_date = new Date(tmp_info).getDate();

  return last_date - today_date;
};

let getDate = () => {
  let tmp_main = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Seoul"
  });
  let date_main = new Date(tmp_main).getDate();
  return date_main;
};

let todayPoint = (initial, delta) => {
  let date = getDate();
  return initial + delta * (date - 1);
};

let tomorrowPoint = (initial, delta) => {
  let date = getDate();
  let remaining = remainingDate();

  if (remaining === 0) {
    return initial;
  }
  return initial + delta * date;
};

/**************************************************/
// Updates

// updateTime
let updateTime = () => {
  // update time
  $("#elapsed-date").text(remainingDate());
  $("#elapsed-time").text(remainingTime());

  setTimeout(updateTime, 1000);
};

// load
let load = () => {
  // update main paint and paints
  readSheet("14RmJK2UOKFodgvEdEKwFCem8jshtdEuUskXQZdlsIsg").then(sheets => {
    console.log(sheets);

    $("#paints").html("");

    let main = sheets.Paints[0];
    let info = sheets.Info[0];

    $("#main-paint").html(`<h1>${main["제목"]}</h1>
    <div class="row">
        <div class="col"><img src="${
          main["그림url"]
        }" style="max-width: 100%;"></div>
    </div>
    <div class="row" style="padding-left: 0%;padding-right: 0%;margin-top: 2em;">
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <h3 style="color: blue;">${info["오늘점수"]}</h3>
            <h4><i class="fa fa-circle" style="color: blue;"></i>&nbsp;${todayPoint(
              main["초기값"],
              main["변화값"]
            )}</h4>
        </div>
        <div class="col-12 col-sm-12 col-md-6 col-lg-6 tomorrow-point">
            <h3 style="color: red;">${info["내일점수"]}</h3>
            <h4><i class="fa fa-arrow-up" style="color: red;"></i>&nbsp;${tomorrowPoint(
              main["초기값"],
              main["변화값"]
            )}</h4>
        </div>
    </div>
    <p style="margin-top: 1em;">Contact us: ${info["콘텍트"]}</p>
    <div class="row">
        <div class="col">
            <p style="width: 100%;max-width: 80%;text-align: justify;color: black;margin-top: 1em;">${
              info["텍스트"]
            }</p>
        </div>
    </div>`);

    sheets.Paints.forEach((paint, index) => {
      if (index === 0) return;

      const title = paint["제목"];
      const url = paint["그림url"];
      const initial = paint["초기값"];
      const delta = paint["변화값"];

      const paint_html = `<div class="col-md-6 col-lg-4" id="card-${index}">
          <div class="card border-0"><img class="card-img-top w-100 d-block card-img-top scale-on-hover" id="paint-${index}" src="${url}" alt="Card Image" style="cursor: pointer;">
              <div class="card-body">
                  <h5>${title}</h5>
                  <div class="row">
                      <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                          <h6><i class="fa fa-circle" style="color: blue;"></i>&nbsp;${todayPoint(
                            initial,
                            delta
                          )}</h6>
                      </div>
                      <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                          <h6><i class="fa fa-arrow-up" style="color: red;"></i>&nbsp;${tomorrowPoint(
                            initial,
                            delta
                          )}</h6>
                      </div>
                  </div>
              </div>
          </div>
      </div>`;

      $("#paints").append(paint_html);

      $(`#paint-${index}`).click(addInteraction(index));
    });
  });
};

/**************************************************/
// Interactions

// addInteraction
let addInteraction = index => () => {
  $(`#card-${index}`).toggleClass("col-md-6");
  $(`#card-${index}`).toggleClass("col-lg-4");

  $(`#card-${index}`).toggleClass("col-md-12");
  $(`#card-${index}`).toggleClass("col-lg-12");
};
