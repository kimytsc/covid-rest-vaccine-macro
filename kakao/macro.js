/**
 * 참고: https://github.com/SJang1/korea-covid-19-remaining-vaccine-macro/blob/main/vaccine-run-kakao.py
 */

(function() {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  Date.prototype.toLocalDateTimeString = function() {
    return this.getFullYear() +
      '-' + pad(this.getMonth() + 1) +
      '-' + pad(this.getDate()) +
      ' ' + pad(this.getHours()) +
      ':' + pad(this.getMinutes()) +
      ':' + pad(this.getSeconds()) +
      '.' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
  };

  var d=document
    , s=d.createElement('textarea');
  s.id="processLogs";
  s.style.height="500px";
  s.style.width="250px";
  d.getElementById(s.id) || d.getElementsByTagName('body')[0].appendChild(s);

  s=d.createElement('textarea');
  s.id="reservationLogs";
  s.style.height="500px";
  s.style.width="500px";
  d.getElementById(s.id) || d.getElementsByTagName('body')[0].appendChild(s);
}());

var vaccineMacro = {
  data: {
    href: 'https://vaccine.kakao.com/api/v1/user',
    delay: 500, // milliseconds
    timeout: 3000,
    reservation: undefined,
    choice: [ // 선택한 백신이 없을 경우, 아무거나 고름
      // "VEN00013", // 화이자
      // "VEN00014", // 모더나
      // "VEN00015", // 아스크라제네카
      // "VEN00016", // 얀센
      // "VEN00017", // ????????
    ],
    coords: {
      bottomRight: {
        x: 127.1054100,
        y: 37.4032979
      },
      onlyLeft: false,
      order: "latitude",
      topLeft: {
        x: 127.1117132,
        y: 37.3998888
      }
    },
    // sampleOrganizations: [{
    //   address: "서울 금천구 한내로 62",
    //   leftCounts: 1,
    //   orgCode: "11378751",
    //   orgName: "빈센트의원",
    //   status: "INPUT_YET",
    //   x: 126.88813348104148,
    //   y: 37.4563767291628
    // }]
  },
  async init() {
    vaccineMacro.log('process', `${ new Date().toLocalDateTimeString() } check`);
    var delayCheck = new Date();
    var signal = new AbortController();
    var abort = setTimeout(() => signal.abort(), vaccineMacro.data.timeout);

    await fetch(`/api/v2/vaccine/left_count_by_coords`, {
      method: 'POST',
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        // "Origin": "https://vaccine-map.kakao.com",
        "Accept-Language": "en-us",
        // "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 9.3.8",
        // "Referer":"https://vaccine-map.kakao.com/",
        "Accept-Encoding": "gzip, deflate",
        // "Connection": "Keep-Alive",
        // "Keep-Alive": "timeout=5, max=1000"
      },
      body: JSON.stringify(vaccineMacro.data.coords),
      signal: signal.signal,
    })
    .then(res => res.json())
    .then(res => res.organizations.filter(item => item.leftCounts > 0))
    .then(res => vaccineMacro.data.sampleOrganizations || res)
    .then(organizations => {
      organizations.forEach(organization => {
        setTimeout(vaccineMacro.tryReservation, 1, organization)
      });
    })
    .finally(() => {
      if (vaccineMacro.data.reservation) {
        var message = `축하합니다! 잔여백신 예약에 성공하셨습니다!

예약시간: ${ new Date().toLocalDateTimeString() }
병원이름: ${ vaccineMacro.data.reservation.organization.orgName }
전화번호: ${ vaccineMacro.data.reservation.organization.phoneNumber }
주소: ${ vaccineMacro.data.reservation.organization.address }
운영시간: ${ vaccineMacro.data.reservation.organization.openHour }
`;
        console.log(message, vaccineMacro.data.reservation);
        // alert(message); // alert 띄울까 말까... telegram을 연동시키려니 귀찮은데..
        vaccineMacro.log('reservation', `${ new Date().toLocalDateTimeString() }`);
      } else {
        // 아직이군요.. 더 돌려볼까요?
        delayCheck = vaccineMacro.data.delay - (new Date() - delayCheck);
        setTimeout(vaccineMacro.init, delayCheck < 0 ? 1 : delayCheck);
      }
    });

    clearTimeout(abort);
  },
  tryReservation(organization) {
    fetch(`/api/v2/org/org_code/${ organization.orgCode }`, {
      method: 'GET',
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        // "Origin": "https://vaccine-map.kakao.com",
        "Accept-Language": "en-us",
        // "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 9.3.8",
        // "Referer":"https://vaccine-map.kakao.com/",
        "Accept-Encoding": "gzip, deflate",
        // "Connection": "Keep-Alive",
        // "Keep-Alive": "timeout=5, max=1000"
      },
    })
    .then(res => res.json())
    .then(res => {
      res.lefts = res.lefts.filter(vaccine => {
        return vaccine.leftCount > 0
          && (vaccineMacro.data.choice.length == 0 || vaccineMacro.data.choice.length && vaccineMacro.data.choice.indexOf(vaccine.vaccineCode) !== -1)
      });
      return res
    })
    .then(res => {
      while (vaccine = res.lefts.shift()) {
        !vaccineMacro.data.reservation && fetch(`/api/v1/reservation`, {
          method: 'POST',
          headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=UTF-8",
            // "Origin": "https://vaccine-map.kakao.com",
            "Accept-Language": "en-us",
            // "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 9.3.8",
            // "Referer":"https://vaccine-map.kakao.com/",
            "Accept-Encoding": "gzip, deflate",
            // "Connection": "Keep-Alive",
            // "Keep-Alive": "timeout=5, max=1000"
          },
          body: JSON.stringify({
            from: "Map",
            vaccineCode: vaccine.vaccineCode,
            orgCode: res.organization.orgCode,
            distance: "null"
          })
        })
        .then(reservation => reservation.json())
        .then(reservation => {
          switch(reservation.code) {
            case 'SUCCESS': // 성공
              vaccineMacro.data.reservation = reservation;
              break;
            case 'NO_VACANCY': // 선착순 실패
            case 'NOT_AVAILABLE': // 잔여백신 접종 예약 가능한 시간이 아닙니다.
            default:
              // console.log(new Date().toLocalDateTimeString(), reservation.code, reservation.desc, reservation.organization);
              break;
          }
          vaccineMacro.log('reservation', `${ new Date().toLocalDateTimeString() } reservation
code&desc: ${ reservation.code } (${ reservation.desc.replace(/\n/g, '') })
orgName: ${ reservation.organization.orgName }
phoneNumber: ${ reservation.organization.phoneNumber }
address: ${ reservation.organization.address }
`);
          return true;
        });
      }
    })
  },
  log(type, text) {
    document.getElementById(`${ type }Logs`).innerHTML = text + "\n" + document.getElementById(`${ type }Logs`).innerHTML.substring(0, 1000)
  }
};



if (location.href != vaccineMacro.data.href) {
  alert("예약신청 페이지로 이동합니다. 즐겨찾기를 다시 눌러주세요.");
  location.href = vaccineMacro.data.href;
} else if (JSON.parse(document.body.innerText).error) {
  alert('카카오 로그인 후 다시 시도해주세요.');
  location.href = "https://accounts.kakao.com/login?continue=https%3A%2F%2Fvaccine.kakao.com%2Fapi%2Fv1%2Fuser";
} else {
  if (document.currentScript && document.currentScript.getAttribute('map')) {
    vaccineMacro.data.map = decodeURIComponent(document.currentScript.getAttribute('map'))
    vaccineMacro.data.bounds = vaccineMacro.data.map.substring(vaccineMacro.data.map.indexOf("bounds=")+7).split(";");
    vaccineMacro.data.coords.bottomRight.x = vaccineMacro.data.bounds[0];
    vaccineMacro.data.coords.bottomRight.y = vaccineMacro.data.bounds[3];
    vaccineMacro.data.coords.topLeft.x = vaccineMacro.data.bounds[2];
    vaccineMacro.data.coords.topLeft.y = vaccineMacro.data.bounds[1];
  };
  vaccineMacro.data.delay = document.currentScript && document.currentScript.getAttribute('delay') && parseInt(document.currentScript.getAttribute('delay')) || vaccineMacro.data.delay;
  vaccineMacro.data.timeout = document.currentScript && document.currentScript.getAttribute('timeout') && parseInt(document.currentScript.getAttribute('timeout')) || vaccineMacro.data.timeout;
  vaccineMacro.data.choice = document.currentScript && document.currentScript.getAttribute('choice') && document.currentScript.getAttribute('choice').split(',') || vaccineMacro.data.choice;

  alert('잔여백신 예약을 시도하겠습니다.');
  vaccineMacro.init();
}
