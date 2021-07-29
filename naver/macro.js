/**
 * 신청현황 확인: https://v-search.nid.naver.com/reservation/me
 */

 (function() {
  // Solved: Mixed Content: The page at 'https://plprice.netlify.app/' was loaded over HTTPS, but requested an insecure script 'https://...'.
  // This request has been blocked; the content must be served over HTTPS.
  var d=document
    , s=d.createElement('meta');
  s.httpEquiv="Content-Security-Policy";
  s.content="upgrade-insecure-requests";
  d.getElementsByTagName('head')[0].appendChild(s);

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
  s.style.border="1px solid black";
  d.getElementById(s.id) || d.getElementsByTagName('body')[0].appendChild(s);

  s=d.createElement('textarea');
  s.id="reservationLogs";
  s.style.height="500px";
  s.style.width="500px";
  s.style.border="1px solid black";
  d.getElementById(s.id) || d.getElementsByTagName('body')[0].appendChild(s);
}());

var vaccineMacro = {
  data: {
    href: {
      info: "https://v-search.nid.naver.com/reservation/info",
      standby: 'https://v-search.nid.naver.com/reservation/standby?orgCd=41376633&sid=1085568538'
    },
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
    // bounds: "126.8770000%3B37.4560000%3B126.9260000%3B37.5170000",
    bounds: "126.8770000;37.4560000;126.9260000;37.5170000",
    // sampleOrganizations: [{
    //   id: "19514283",
    //   name: "명소아청소년과의원",
    //   roadAddress: "서울 영등포구 도림로38길 4",
    //   x: "126.8971880",
    //   y: "37.4926510",
    //   vaccineQuantity: {
    //     totalQuantity: 0,
    //     vaccineOrganizationCode: "11346957",
    //     list: [{
    //       quantity: 0,
    //       quantityStatus: "waiting",
    //       vaccineType: "화이자"
    //     }, {
    //       quantity: 0,
    //       quantityStatus: "waiting",
    //       vaccineType: "모더나"
    //     }]
    //   }
    // }]
  },
  log(type, text) {
    document.getElementById(`${ type }Logs`).innerHTML = text + "\n" + document.getElementById(`${ type }Logs`).innerHTML.substring(0, 1000)
  },
  async init() {
    vaccineMacro.log('process', `${ new Date().toLocalDateTimeString() } check`);
    var delayCheck = new Date();
    var signal = new AbortController();
    var abort = setTimeout(() => signal.abort(), vaccineMacro.data.timeout);

    await fetch(`https://api.place.naver.com/graphql`, {
      method: 'POST',
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify([{
        operationName: "vaccineList",
        variables: {
          input: {
            keyword: "코로나백신위탁의료기관"
          },
          businessesInput: {
            start: 0,
            display: 100,
            deviceType: "mobile",
            bounds: vaccineMacro.data.bounds // 2021-07-26 검색된 병원 198개
          }
        },
        query: `query vaccineList($input: RestsInput, $businessesInput: RestsBusinessesInput) {
          rests(input: $input) {
            businesses(input: $businessesInput) {
              total
              vaccineLastSave
              isUpdateDelayed
              items {
                id
                name
                roadAddress
                x
                y
                vaccineQuantity {
                  totalQuantity
                  vaccineOrganizationCode
                  list {
                    quantity
                    quantityStatus
                    vaccineType
                  }
                }
              }
            }
          }
        }`
      }]),
      signal: signal.signal,
    })
    .then(res => res.json())
    .then(res => res.shift())
    .then(res => res.data.rests.businesses.items.filter(item => item.vaccineQuantity && item.vaccineQuantity.totalQuantity > 0))
    .then(res => vaccineMacro.data.sampleOrganizations || res)
    .then(res => {
      while (bussiness = res.shift()) {
        setTimeout(vaccineMacro.standby, 1, bussiness);
      }
    })
    .catch(e => {})
    .finally(() => {
      if (vaccineMacro.data.reservation) {
        var message = `축하합니다! 잔여백신 예약에 성공하셨습니다!

예약시간: ${ new Date().toLocalDateTimeString() }
병원이름: ${ vaccineMacro.data.reservation.name }
주소: ${ vaccineMacro.data.reservation.roadAddress }
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
  standby(bussiness) {
    fetch(`https://v-search.nid.naver.com/reservation/standby?orgCd=${ bussiness.vaccineQuantity.vaccineOrganizationCode }&sid=${ bussiness.id }`, {
      method: 'GET',
    })
    .then(res => res.url.split('key=')[1])
    .then(key => {
      var vaccines = bussiness.vaccineQuantity.list.map(vaccine => Object.assign(vaccine, {
          vaccineCode: ({
            "화이자": "VEN00013",
            "모더나": "VEN00014",
            "아스크라제네카": "VEN00015",
            "얀센": "VEN00016",
            "???": "VEN00017"
          })[vaccine.vaccineType]
        })
      ).filter(vaccine => vaccine.quantity > 0
        && (vaccineMacro.data.choice.length == 0 || vaccineMacro.data.choice.length && vaccineMacro.data.choice.indexOf(vaccine.vaccineCode) !== -1)
      );
      while(vaccine = vaccines.shift()) {
        setTimeout(vaccineMacro.reservation, 1, bussiness, key, vaccine.vaccineCode)
      }
    });
  },
  reservation(bussiness, key, cd) {
    fetch(`/reservation/progress?key=${ key }&cd=${ cd }`, {
      method: 'GET',
    })
    .then(res => fetch(`/reservation/confirm?key=${ key }`, {
      method: "POST",
    }))
    .then(res => res.json())
    .then(res => {
      switch(res.code) {
        case 'SUCCESS':
          vaccineMacro.data.reservation = bussiness;
          location.href = `/reservation/success?key=${ key }`;
          break;
        case 'SOLD_OUT':
        default:
          break;
      }
      vaccineMacro.log('reservation', `${ new Date().toLocalDateTimeString() }
code: ${ res.code }
message; ${ res.message }
`);
    })
    .catch(e => {
      console.log(e);
      // error
    })
  }
};


if (`${ location.origin }${ location.pathname }` == vaccineMacro.data.href.info) {
  if ($('#check_all').length) {
    alert("개인정보 수집 및 제공 전체동의를 제거하겠습니다. 즐겨찾기를 다시 눌러주세요.")
    $('#reservation_confirm').addClass('on')[0].click();
  } else {
    if (document.currentScript && document.currentScript.getAttribute('map')) {
      vaccineMacro.data.map = decodeURIComponent(document.currentScript.getAttribute('map'))
      vaccineMacro.data.bounds = vaccineMacro.data.map.substring(vaccineMacro.data.map.indexOf("bounds=")+7);
    };
    vaccineMacro.data.delay = document.currentScript && document.currentScript.getAttribute('delay') && parseInt(document.currentScript.getAttribute('delay')) || vaccineMacro.data.delay;
    vaccineMacro.data.timeout = document.currentScript && document.currentScript.getAttribute('timeout') && parseInt(document.currentScript.getAttribute('timeout')) || vaccineMacro.data.timeout;
    vaccineMacro.data.choice = document.currentScript && document.currentScript.getAttribute('choice') && document.currentScript.getAttribute('choice').split(',') || vaccineMacro.data.choice;
  
    alert('잔여백신 예약을 시도하겠습니다.');
    vaccineMacro.init();
  }
} else {
  alert("예약신청 페이지로 이동합니다. 즐겨찾기를 다시 눌러주세요.");
  location.href = vaccineMacro.data.href.standby;
}
