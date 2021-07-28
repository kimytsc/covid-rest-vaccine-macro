/**
 * 참고: https://github.com/SJang1/korea-covid-19-remaining-vaccine-macro/blob/main/vaccine-run-kakao.py
 * 
 * 
 * 작업순서
 * 1. 새 창 또는 새 탭을 열고 "https://www.daum.net"에 들어간다.
 * 2. 로그인을 한다.
 * 3. 새 창 또는 새 탭을 열고 "https://vaccine.kakao.com/api/v1/user"에 들어간다.
 *    만약, "{"error":"error occurred"}" 가 보인다면, 2번의 과정에서 로그아웃 후 다시 로그인을 하고 새로고침을 해본다.
 *    아니라면, 다음 과정을 이어서 한다.
 * 4. 3번창에서 F12를 눌러 DevTools 창을 띄운다
 * 5. 4번창에서 "Console"탭을 누른다.
 * 6. "원하는 크기의 지도 좌표를 구하는 방법"을 참고하여 내가 원하는 위치의 병원들을 설정한다.
 * 7. 아래의 소스를 전부 복사해서 붙여넣고 실행시킨다.
 * 8. 간절히 바라면 매크로가 나서서 도와준다.
 * 
 * 
 * 원하는 크기의 지도 좌표를 구하는 방법
 * 1. "https://m.place.naver.com/rest/vaccine?vaccineFilter=used" 에서 원하는 위치, (적당한) 크기를 만든다.
 * 2. "현 지도에서 검색"을 누른다.
 * 3. URL이 아래의 예제와 같이 바뀌는걸 확인한다.
 *    ex) https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=126.9015361&y=37.4858157&bounds=126.8770000%3B37.4560000%3B126.9260000%3B37.5170000
 * 4. url을 복사한 후 아래의 명령어를 값을 바꾸고 실행한다.
      ((url) => {
        coords = decodeURIComponent(url).split("bounds=")[1].split(";")
        console.log(`{
          bottomRight: {
            x: ${ coords[0] },
            y: ${ coords[3] }
          },
          onlyLeft: false,
          order: "latitude",
          topLeft: {
            x: ${ coords[2] },
            y: ${ coords[1] }
          }
        }`);
      })("복사한 URL을 여기에 입력")
 * 5. 출력된 값을 가지고 아래 소스 중 "coords:"" 부분의 값을 변경한다.
 */

(function() {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  Object.prototype.join = function(separator){
    var s = this,
        arr = new Array();

    Object.keys(s).forEach(function(key){
        arr[arr.length] = key + '=' + s[key];
    });

    return arr.join(separator || '&')
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
        x: 126.8770000,
        y: 37.5170000
      },
      onlyLeft: false,
      order: "latitude",
      topLeft: {
        x: 126.9260000,
        y: 37.4560000
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

vaccineMacro.init();
