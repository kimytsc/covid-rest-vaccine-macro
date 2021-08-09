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
 * 8. 간절히 바라면 스크립트가 나서서 도와준다.
 * 
 * 
 * 원하는 크기의 지도 좌표를 구하는 방법
 * 1. "https://m.place.naver.com/rest/vaccine?vaccineFilter=used" 에서 원하는 위치, (적당한) 크기를 만든다.
 * 2. "현 지도에서 검색"을 누른다.
 * 3. URL이 아래의 예제와 같이 바뀌는걸 확인한다.
 *    ex) https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=127.1054288&y=37.3594909&bounds=127.1022772%3B37.3577853%3B127.1085804%3B37.3611964
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

  Date.prototype.toLocalDateTimeString = function() {
    return this.getFullYear() +
      '-' + pad(this.getMonth() + 1) +
      '-' + pad(this.getDate()) +
      ' ' + pad(this.getHours()) +
      ':' + pad(this.getMinutes()) +
      ':' + pad(this.getSeconds()) +
      '.' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
  };
}());

var vaccineMacro = {
  data: {
    delay: 1000, // milliseconds
    timeout: 3000,
    remember: {
      term: 60000,
      organizations: {
        // "1234567": {update: 1628486735827, leftCounts: 5}
      }
    },
    reservation: undefined,
    choice: [ // 특정 백신만 선택하고 싶은 경우, 주석(//)을 제거 후 사용. 선택한 백신이 없는(모두 주석 처리된) 경우, 해당 병원의 모든 잔여백신을 대상으로 동작
      "VEN00013", // 화이자
      "VEN00014", // 모더나
      // "VEN00015", // 아스트라제네카
      // "VEN00016", // 얀센
      // "VEN00017", // 노바백스
      // "VEN00018", // 시노팜
      // "VEN00019", // 시노백
      // "VEN00020", // 스푸트니크V
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
    // sampleAgreement: {
    //   agreedAt: null, // "2021-01-01 00:00:00",
    //   locationAgreedAt: null, // "2021-01-01 00:00:00",
    //   noticeReadAt: null,
    //   over18: false,
    //   over50: false,
    //   under14: false,
    // },
    // sampleStatus: {
    //   certificate: "EXPIRED", // ACTIVE | EXPIRED
    //   me: "INACTIVE", // ACTIVE | INACTIVE
    //   over18: false,
    //   over50: false,
    //   under14: false,
    // },
    // sampleOrganizations: {
    //   organizations: [{
    //     address: "서울 금천구 한내로 62",
    //     leftCounts: 0,
    //     orgCode: "11378751",
    //     orgName: "빈센트의원",
    //     status: "INPUT_YET",
    //     x: 126.88813348104148,
    //     y: 37.4563767291628
    //   }],
    // },
    // sampleOrganization: {
    //   organization: {
    //     orgCode: "11378751",
    //     orgName: "빈센트의원",
    //     confirmId: "597399166",
    //     phoneNumber: "02-898-9121",
    //     address: "서울 금천구 한내로 62",
    //     x: 126.88813348104148,
    //     y: 37.4563767291628,
    //     openHour: {
    //       date: "2021-08-02",
    //       dayOfWeek: "월요일",
    //       dayOff: true,
    //       openHour: {
    //         start: "10:00",
    //         end: "17:00"
    //       },
    //       lunch: {
    //         start: "13:00",
    //         end: "14:00"
    //       }
    //     },
    //     disabled: false
    //   },
    //   alarmed: false,
    //   agreement: {
    //     noticeReadAt: null,
    //     agreedAt: "2021-07-28 01:12:37",
    //     locationAgreedAt: "2021-07-28 01:12:37",
    //     under14: false,
    //     over50: true,
    //     over18: true
    //   },
    //   status: "CLOSED",
    //   leftCount: 0,
    //   lefts: [{
    //     vaccineType: "Pfizer",
    //     vaccineName: "화이자",
    //     vaccineCode: "VEN00013",
    //     status: "CLOSED",
    //     leftCount: 0
    //   }, {
    //     vaccineType: "Moderna",
    //     vaccineName: "모더나",
    //     vaccineCode: "VEN00014",
    //     status: "CLOSED",
    //     leftCount: 0
    //   }],
    //   selectableVaccineCodes: ["VEN00015", "VEN00016", "VEN00013", "VEN00014", "VEN00017"]
    // },
    // sampleReservation: {
    //   code: "NO_VACANCY",
    //   desc: "잔여백신 접종 신청이\n선착순 마감되었습니다.",
    //   organization: {
    //     orgCode: "11378751",
    //     orgName: "빈센트의원",
    //     confirmId: "597399166",
    //     phoneNumber: "02-898-9121",
    //     address: "서울 금천구 한내로 62",
    //     x: 126.88813348104148,
    //     y: 37.4563767291628,
    //     openHour: {
    //       date: "2021-08-03",
    //       dayOfWeek: "화요일",
    //       dayOff: true,
    //       openHour: {
    //         start: "10:00",
    //         end: "17:00"
    //       },
    //       lunch: {
    //         start: "13:00",
    //         end: "14:00"
    //       }
    //     },
    //     disabled: false
    //   }
    // }
  },
  mounted() {
    var d=document
      , s=d.createElement('link');
    s.id="naverStyle";
    s.rel="stylesheet";
    s.type="text/css";
    s.href="https://v-search.nid.naver.com/css/vaccine.css";
    d.getElementById(s.id) || d.getElementsByTagName('head')[0].appendChild(s);

    s=d.createElement('style');
    s.id="kakaoColor";
    s.innerText = `
    h1.h_title .accent,
    .process_list .process_item.on,
    .apply_area .info_box .info_title {
      color:#000000;
    }
    .apply_area .info_box {
      background: #000000;
      background: linear-gradient(to right,#FEE500 0,#FEE500 100%);
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#FEE500', endColorstr='#FEE500', GradientType=1 );
    }
    .process_list .process_item svg {
      position: absolute;
      left: 0;
      top: 0;
      fill: #D3D3D3
    }
    .process_list .process_item.on svg {
      fill: #FEE500
    }`;
    d.getElementById(s.id) || d.getElementsByTagName('head')[0].appendChild(s);
    
    d.getElementsByTagName('body')[0].innerHTML = `<div id="wrap" class="wrap">
      <header class="header" role="banner">
        <div class="inner">
          <h1 class="doc-title">
            <svg width="74" viewBox="0 0 75 25" class="ico_logo">
              <defs>
                <path id="os5cgsl0ta" d="M0.011 0.205L11.948 0.205 11.948 22.203 0.011 22.203z"></path>
                <path id="oanpyfjipc" d="M0.264 0.004L13.566 0.004 13.566 15.487 0.264 15.487z"></path>
              </defs>
              <g fill="#000000" fill-rule="evenodd">
                <g>
                  <path d="M18.91 20.05c.344 0 .7-.046 1.071-.137.371-.09.742-.209 1.113-.354.371-.146.72-.323 1.045-.532.327-.21.616-.432.87-.668V14.87h-2.607c-1.32 0-2.284.227-2.89.681-.606.455-.91 1.173-.91 2.154 0 1.562.769 2.344 2.308 2.344m-4.706-2.235c0-1.508.503-2.658 1.513-3.448 1.008-.79 2.476-1.186 4.401-1.186h2.89v-.954c0-2.308-1.018-3.461-3.053-3.461-.653 0-1.34.09-2.057.272-.719.182-1.377.409-1.977.681l-.736-1.771c.745-.418 1.55-.74 2.413-.968.862-.227 1.704-.341 2.52-.341 3.526 0 5.288 1.88 5.288 5.642v9.54h-1.852l-.3-1.635c-.745.6-1.54 1.063-2.385 1.39-.845.328-1.649.49-2.414.49-1.325 0-2.365-.376-3.12-1.13-.754-.754-1.131-1.794-1.131-3.12" transform="translate(-151 -168) translate(79.5 145) translate(72 24) translate(.956 .112)" class="path"></path>
                  <g transform="translate(-151 -168) translate(79.5 145) translate(72 24) translate(.956 .112) translate(29.859)">
                    <mask id="5ym1s98mqb" fill="#fff">
                      <use xlink:href="#os5cgsl0ta"></use>
                    </mask>
                    <path d="M9.222 6.53l1.963 1.416-4.823 6.052 5.586 6.705-1.934 1.5-6.596-8.07L9.222 6.53zM2.518 21.82H.011V.75L2.518.206V21.82z" mask="url(#5ym1s98mqb)" class="path"></path>
                  </g>
                  <path d="M48.735 20.05c.343 0 .701-.046 1.072-.137.371-.09.742-.209 1.113-.354.37-.146.718-.323 1.045-.532.324-.21.614-.432.868-.668V14.87h-2.606c-1.322 0-2.285.227-2.89.681-.607.455-.909 1.173-.909 2.154 0 1.562.768 2.344 2.307 2.344m-4.706-2.235c0-1.508.504-2.658 1.512-3.448 1.01-.79 2.475-1.186 4.403-1.186h2.889v-.954c0-2.308-1.017-3.461-3.053-3.461-.655 0-1.34.09-2.058.272-.719.182-1.377.409-1.975.681l-.737-1.771c.746-.418 1.55-.74 2.412-.968.862-.227 1.703-.341 2.522-.341 3.524 0 5.288 1.88 5.288 5.642v9.54h-1.855l-.3-1.635c-.745.6-1.538 1.063-2.385 1.39-.844.328-1.648.49-2.411.49-1.327 0-2.368-.376-3.121-1.13-.755-.754-1.131-1.794-1.131-3.12" transform="translate(-151 -168) translate(79.5 145) translate(72 24) translate(.956 .112)" class="path"></path>
                  <g transform="translate(-151 -168) translate(79.5 145) translate(72 24) translate(.956 .112) translate(58.405 6.66)">
                    <mask id="e5668wah2d" fill="#fff">
                      <use xlink:href="#oanpyfjipc"></use>
                    </mask>
                    <path d="M6.915 2.021c-1.308 0-2.312.491-3.011 1.472-.701.982-1.05 2.417-1.05 4.307 0 1.872.349 3.285 1.05 4.239.699.954 1.703 1.431 3.011 1.431 1.326 0 2.34-.477 3.04-1.431.7-.954 1.049-2.367 1.049-4.239 0-1.89-.35-3.325-1.049-4.307-.7-.981-1.714-1.472-3.04-1.472m0-2.017c2.071 0 3.699.673 4.878 2.017 1.182 1.346 1.773 3.272 1.773 5.78 0 2.47-.585 4.37-1.758 5.697-1.172 1.325-2.804 1.989-4.893 1.989-2.07 0-3.698-.664-4.878-1.99C.855 12.172.264 10.272.264 7.8c0-2.507.594-4.433 1.785-5.779C3.24.677 4.862.004 6.915.004" mask="url(#e5668wah2d)" class="path"></path>
                  </g>
                  <path d="M2.552.205L.044.75v21.07h2.508V.204zm.9 13.929l6.595 8.069 1.937-1.5-5.589-6.705 4.825-6.051-1.962-1.418-5.807 7.605z" transform="translate(-151 -168) translate(79.5 145) translate(72 24) translate(.956 .112)" class="path"></path>
                </g>
              </g>
            </svg>
          </h1>
        </div>
      </header>
      <div id="container" class="container">
        <div class="content" role="main">
          <div class="process_box">
            <ul class="process_list">
              <li class="process_item on">
                <span class="certify">
                  <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="2 2 20 20" width="32px">
                    <path fill="#FFFFFF" d="M0 0h24v24H0z"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                  <span class="txt">로그인</span>
                </span>
              </li>
              <li class="process_item on">
                <span class="reservation">
                  <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="2 2 20 20" width="32px">
                    <path fill="#FFFFFF" d="M0 0h24v24H0V0z"/>
                    <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7zm12-4h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04-.39.08-.74.28-1.01.55-.18.18-.33.4-.43.64-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z"/>
                  </svg>
                  <span class="txt">예약신청</span>
                </span>
              </li>
              <li class="process_item" id="processFinish">
                <span class="finish">
                  <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="2 2 20 20" width="32px">
                    <path fill="#FFFFFF" d="M0 0h24v24H0V0z"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
                  </svg>
                  <span class="txt">예약완료</span>
                </span>
              </li>
            </ul>
          </div>
          <div class="apply_area">
            <div class="apply_wrap">
              <h1 class="h_title">
                <span id="organizations">0</span>개 <span class="accent">리스트에서 잔여백신</span> 예약시도중
              </h1>
              <div class="info_box on">
                <div class="info_box_inner">
                  <div class="info_item">
                    <strong class="info_title">
                      업데이트 시간<div class="notice"><span id="nowUpdate"></span> 업데이트 시도중</div>
                      <div class="error">
                        <span id="lastUpdate"></span>
                      </div>
                    </strong>
                  </div>
                  <div class="info_item">
                    <strong class="info_title">
                      예약시도 상태
                    </strong>
                    <div class="error" id="lastResult">
                      현재 잔여백신이 없습니다.
                    </div>
                    <dl class="info_list" id="reservationInfo"></dl>
                  </div>
                </div>
              </div>
              <div class="info_box">
                <div class="info_box_inner"><div class="info_item">
                  <strong class="info_title">예약시도 위치 확인</strong>
                  <div class="error">
                    <img style="width:100%" src="${ vaccineMacro.mapImage() }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return vaccineMacro;
  },
  async init() {
    vaccineMacro.log('nowUpdate', new Date().toLocalDateTimeString());
    var delayCheck = new Date();
    var signal = new AbortController();
    var abort = setTimeout(() => signal.abort(), vaccineMacro.data.timeout);

    await fetch(`/api/v3/vaccine/left_count_by_coords`, {
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
    .then(res => {
      vaccineMacro.log('lastUpdate', new Date().toLocalDateTimeString()); // kakao는 naver의 vaccineLastSave 값이 API에 없음?
      vaccineMacro.log('organizations', res.organizations.length);
      return vaccineMacro.data.sampleOrganizations || res
    })
    .then(res => res.organizations.filter(item => item.leftCounts > 0))
    .then(organizations => {
      organizations.forEach(organization => {
        !vaccineMacro.data.remember.organizations[organization.orgCode] && setTimeout(vaccineMacro.standby, 1, organization)
      });
      return organizations
    })
    .then(organizations => {
      // 트래픽 이슈 또는 AZ와 같이 50대 이상만 신청할 수 있어 백신 수량이 남아 있는 경우, remember 설정값 이내의 요청된 결과 값과 비교하여 다를 경우에만 진행하여 잦은 호출 하지 않도록 개선
      let now = new Date().getTime();
      return organizations.filter(item => {
        return vaccineMacro.data.remember.organizations[item.orgCode] === undefined
        || vaccineMacro.data.remember.organizations[item.orgCode].leftCounts != item.leftCounts
        || now - vaccineMacro.data.remember.organizations[item.orgCode].update < vaccineMacro.data.remember.term
      })
    })
    .then(organizations => organizations.map(item => Object.assign({update: (vaccineMacro.data.remember.organizations[item.orgCode] || {}).update || new Date().getTime()}, item)))
    .then(organizations => Object.fromEntries(organizations.map(item => [item.orgCode, item])))
    .then(organizations => vaccineMacro.data.remember.organizations = organizations)
    .finally(() => {
      if (vaccineMacro.data.reservation) {
        vaccineMacro.data.coords.bottomRight.x = vaccineMacro.data.reservation.organization.x
        vaccineMacro.data.coords.bottomRight.y = vaccineMacro.data.reservation.organization.y
        vaccineMacro.data.coords.topLeft.x = vaccineMacro.data.reservation.organization.x
        vaccineMacro.data.coords.topLeft.y = vaccineMacro.data.reservation.organization.y

        vaccineMacro.log('lastResult', '축하합니다! 잔여백신 예약에 성공하셨습니다!');
        vaccineMacro.log('reservationInfo', ((obj) => {
          let info = '';
          for(const d in obj) {
            info += `<dt class="term">${ d }</dt><dd class="desc"><span class="text">${ obj[d] }</span></dd>`
          }
          return info;
        })({
          '병원이름': vaccineMacro.data.reservation.organization.orgName,
          '전화번호': vaccineMacro.data.reservation.organization.phoneNumber,
          '병원주소': vaccineMacro.data.reservation.organization.address,
          '운영종료': `오늘 ${ vaccineMacro.data.reservation.organization.openHour.openHour.end } 까지 (${ vaccineMacro.data.reservation.organization.openHour.date } ${ vaccineMacro.data.reservation.organization.openHour.dayOfWeek })`,
          '병원위치': `<img src="${ vaccineMacro.mapImage(5) }">
                      <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#00A0F0" style="width:48px;height:48px;position:absolute;left:201px;top:177px;">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M12 2c3.86 0 7 3.14 7 7 0 5.25-7 13-7 13S5 14.25 5 9c0-3.86 3.14-7 7-7zm-1.53 12L17 7.41 15.6 6l-5.13 5.18L8.4 9.09 7 10.5l3.47 3.5z"/>
                      </svg>`
        }));

        document.getElementById('processFinish').classList.add('on');

        // kakao는 naver와는 달리 성공시 안내 페이지가 없어 페이지 이동 없음

        if (window && window.navigator && window.navigator.vibrate) {
          // mobile에서 성공시 진동 알림 추가
          window.navigator.vibrate([500, 250, 500, 250, 500, 250, 500, 250, 500]);
        }

        // sound 출처: https://mixkit.co/free-sound-effects/clap/
        (new Audio("https://raw.githubusercontent.com/kimytsc/covid-rest-vaccine-macro/resources/main/sounds/mixkit-conference-audience-clapping-strongly-476.wav")).play()
      } else {
        // 아직이군요.. 더 돌려볼까요?
        delayCheck = vaccineMacro.data.delay - (new Date() - delayCheck);
        setTimeout(vaccineMacro.init, delayCheck < 0 ? 1 : delayCheck);
      }
    });

    clearTimeout(abort);
  },
  standby(organization) {
    fetch(`/api/v3/org/org_code/${ organization.orgCode }`, {
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
    .then(res => vaccineMacro.data.sampleOrganization || res)
    .then(res => {
      res.lefts = res.lefts.filter(vaccine => {
        return vaccine.leftCount > 0
          && (vaccineMacro.data.choice.length == 0 || vaccineMacro.data.choice.length && vaccineMacro.data.choice.indexOf(vaccine.vaccineCode) !== -1)
      });
      return res
    })
    .then(res => {
      if (vaccineMacro.data.sampleReservation) {
        vaccineMacro.data.reservation = vaccineMacro.data.sampleReservation;
        return {lefts:[]};
      }
      return res;
    })
    .then(res => {
      while (vaccine = !vaccineMacro.data.reservation && res.lefts.shift()) {
        setTimeout(vaccineMacro.reservation, 1, organization, vaccine)
      }
    })
  },
  async reservation(organization, vaccine) {
    var signal = new AbortController();
    var abort = setTimeout(() => signal.abort(), vaccineMacro.data.timeout);

    await fetch(`/api/v2/reservation`, {
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
        orgCode: organization.orgCode,
        distance: "null"
      }),
      signal: signal.signal,
    })
    .then(res => res.json())
    .then(res => {
      switch(res.code) {
        case 'SUCCESS': // 성공
          vaccineMacro.data.reservation = res;
          break;
        case 'NO_VACANCY': // 선착순 실패
        case 'NOT_AVAILABLE': // 잔여백신 접종 예약 가능한 시간이 아닙니다.
        case 'NO_SUITABLE': // 화이자・모더나는 18세 이상 (2003.12.31 이전 출생자) 부터 예약 가능하며 아스트라제네카는 50세 이상 (1971.12.31 이전 출생자) 부터 예약 가능합니다. 접종 가능한 잔여백신은 백신별 공급시기 및 예방접종 계획에 따라 변경될 수 있습니다.
        case 'ALREADY_RESERVED': // 백신접종 예약내역이 있거나 이미 접종을 하신 경우 잔여백신 접종 신청이 불가합니다.
        case 'NOT_REGISTERED': // 백신접종 예약내역이 있거나 이미 접종을 하신 경우 잔여백신 접종 신청이 불가합니다.
        case 'ERROR_OCCURRED': // 백신접종 예약내역이 있거나 이미 접종을 하신 경우 잔여백신 접종 신청이 불가합니다.
        case 'ALREADY_REGISTERED': // 백신접종 예약내역이 있거나 이미 접종을 하신 경우 잔여백신 접종 신청이 불가합니다.
        case 'POSTPONED': // 백신접종 예약내역이 있거나 이미 접종을 하신 경우 잔여백신 접종 신청이 불가합니다.
        default:
          // console.log(new Date().toLocalDateTimeString(), reservation.code, reservation.desc, reservation.organization);
          break;
      }
      vaccineMacro.log('lastResult', `[${ res.organization.orgName }] ${ res.desc.replace(/\n/g, ' ') }`);
      return true;
    });

    clearTimeout(abort);
  },
  log(type, text) {
    document.getElementById(`${ type }`).innerHTML = text;
  },
  mapImage(scale) {
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
    let rb = {
        $f: 38,
        Nh: 500000,
        Oh: 200000,
        Uf: 6378137,
        ag: 127,
        eh: 1,
        og: 0.0033528106647474805,
      },
      R = 6371, // Radius of the earth in km
      x = (vaccineMacro.data.coords.bottomRight.x + vaccineMacro.data.coords.topLeft.x) / 2,
      y = (vaccineMacro.data.coords.bottomRight.y + vaccineMacro.data.coords.topLeft.y) / 2,
      a = Math.sin,
      m = rb.$f,
      o = rb.Nh,
      q = rb.Oh,
      e = rb.Uf,
      p = rb.ag,
      f = rb.eh,
      n = 1 < rb.og && 1 / rb.og || rb.og,
      h = Math.atan(1) / 45,
      i = y * h,
      j = x * h,
      l = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      w = 0,
      v = 0;
    scale = scale || 20;
    m *= h;
    h *= p;
    n = 1 / n;
    l = e * (n - 1) / n;
    p = (Math.pow(e, 2) - Math.pow(l, 2)) / Math.pow(e, 2);
    n = (Math.pow(e, 2) - Math.pow(l, 2)) / Math.pow(l, 2);
    l = (e - l) / (e + l);
    r = e * (1 - l + 5 * (Math.pow(l, 2) - Math.pow(l, 3)) / 4 + 81 * (Math.pow(l, 4) - Math.pow(l, 5)) / 64);
    s = 3 * e * (l - Math.pow(l, 2) + 7 * (Math.pow(l, 3) - Math.pow(l, 4)) / 8 + 55 * Math.pow(l, 5) / 64) / 2;
    t = 15 * e * (Math.pow(l, 2) - Math.pow(l, 3) + 3 * (Math.pow(l, 4) - Math.pow(l, 5)) / 4) / 16;
    u = 35 * e * (Math.pow(l, 3) - Math.pow(l, 4) + 11 * Math.pow(l, 5) / 16) / 48;
    w = 315 * e * (Math.pow(l, 4) - Math.pow(l, 5)) / 512;
    j -= h;
    m = r * m - s * Math.sin(2 * m) + t * Math.sin(4 * m) - u * Math.sin(6 * m) + w * Math.sin(8 * m);
    l = m * f;
    v = Math.sin(i);
    m = Math.cos(i);
    h = v / m;
    n *= Math.pow(m, 2);
    p = e / Math.sqrt(1 - p * Math.pow(Math.sin(i), 2));
    i = r * i - s * Math.sin(2 * i) + t * Math.sin(4 * i) - u * Math.sin(6 * i) + w * Math.sin(8 * i);
    a = [];
    i *= f;
    r = p * v * m * f / 2;
    s = p * v * Math.pow(m, 3) * f * (5 - Math.pow(h, 2) + 9 * n + 4 * Math.pow(n, 2)) / 24;
    t = p * v * Math.pow(m, 5) * f * (61 - 58 * Math.pow(h, 2) + Math.pow(h, 4) + 270 * n - 330 * Math.pow(h, 2) * n + 445 * Math.pow(n, 2) + 324 * Math.pow(n, 3) - 680 * Math.pow(h, 2) * Math.pow(n, 2) + 88 * Math.pow(n, 4) - 600 * Math.pow(h, 2) * Math.pow(n, 3) - 192 * Math.pow(h, 2) * Math.pow(n, 4)) / 720;
    v = p * v * Math.pow(m, 7) * f * (1385 - 3111 * Math.pow(h, 2) + 543 * Math.pow(h, 4) - Math.pow(h, 6)) / 40320;
    i = i + Math.pow(j, 2) * r + Math.pow(j, 4) * s + Math.pow(j, 6) * t + Math.pow(j, 8) * v;
    a[1] = i - l + o;
    i = p * m * f;
    l = p * Math.pow(m, 3) * f * (1 - Math.pow(h, 2) + n) / 6;
    n = p * Math.pow(m, 5) * f * (5 - 18 * Math.pow(h, 2) + Math.pow(h, 4) + 14 * n - 58 * Math.pow(h, 2) * n + 13 * Math.pow(n, 2) + 4 * Math.pow(n, 3) - 64 * Math.pow(h, 2) * Math.pow(n, 2) - 25 * Math.pow(h, 2) * Math.pow(n, 3)) / 120;
    m = p * Math.pow(m, 7) * f * (61 - 479 * Math.pow(h, 2) + 179 * Math.pow(h, 4) - Math.pow(h, 6)) / 5040;
    a[0] = q + j * i + Math.pow(j, 3) * l + Math.pow(j, 5) * n + Math.pow(j, 7) * m;

    l = deg2rad(vaccineMacro.data.coords.bottomRight.x - vaccineMacro.data.coords.topLeft.x);
    v = Math.sin(l/2) * Math.sin(l/2);
    i = 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1-v));
    w = ((R * i * 100) || 450).toFixed(0);
    w = w > 520 ? 520 : w;
  
    l = deg2rad(vaccineMacro.data.coords.topLeft.y - vaccineMacro.data.coords.bottomRight.y);
    v = Math.cos(deg2rad(x)) * Math.cos(deg2rad(x)) * Math.sin(l/2) * Math.sin(l/2);
    i = 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1-v));
    h = ((R * i * 200) || 450).toFixed(0);

    return `https://map.kakao.com/etc/saveMap.jsp?SCALE=${ scale }&MX=${ (2.5 * a[0]).toFixed(0) }&MY=${ (2.5 * a[1]).toFixed(0) }&type=roadmap&S=0&IW=${ w }&IH=${ h }&LANG=0&COORDSTM=WCONGNAMUL&logo=kakao_logo`;
  },
  agreementCheck() {
    return fetch(`/api/v1/agreement`, {
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
    .then(res => this.data.sampleAgreement || res)
    .then(res => {
      if (res.error) {
        this.log('lastResult', `로그인 후 다시 시도해주세요.`);
        return false;
      }
      if (res.agreedAt === null) {
        this.log('lastResult', `서비스 이용을 위해서는 본인확인을 위한 카카오 인증서 발급이 필요합니다.<br>카카오톡에서 인증서 발급 후 다시 시도해주세요.`);
        return false;
      }
      if (res.under14 === true) {
        this.log('lastResult', `만 14세 미만은 서비스를 이용하실 수 없습니다.`);
        return false;
      }
      if (res.over18 !== true) {
        this.log('lastResult', `잔여백신 접종은 18 세 이상만 가능합니다.`);
        return false;
      }

      return this;
    });
  },
  // agreementCheck에서 under14, over18 값이 같이 오고 있어 statusCheck로 체크할 필요가 없어보임
  // statusCheck() {
  //   return fetch(`/api/v1/me/status`, {
  //     method: 'GET',
  //     headers: {
  //       "Accept": "application/json, text/plain, */*",
  //       "Content-Type": "application/json;charset=UTF-8",
  //       // "Origin": "https://vaccine-map.kakao.com",
  //       "Accept-Language": "en-us",
  //       // "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 9.3.8",
  //       // "Referer":"https://vaccine-map.kakao.com/",
  //       "Accept-Encoding": "gzip, deflate",
  //       // "Connection": "Keep-Alive",
  //       // "Keep-Alive": "timeout=5, max=1000"
  //     },
  //   })
  //   .then(res => res.json())
  //   .then(res => this.data.sampleStatus || res)
  //   .then(res => {
  //     if (res.error) {
  //       vaccineMacro.log('lastResult', `로그인 후 다시 시도해주세요.`);
  //       return false;
  //     }

  //     if (res.under14 === true) {
  //       vaccineMacro.log('lastResult', `만 14세 미만은 서비스를 이용하실 수 없습니다.`);
  //       return false;
  //     }
  
  //     if (res.over18 !== true) {
  //       vaccineMacro.log('lastResult', `잔여백신 접종은 18 세 이상만 가능합니다.`);
  //       return false;
  //     }

  //     return true;
  //   });
  // }
};

if (dcs = document.currentScript) {
  if (dcs.getAttribute('map')) {
    vaccineMacro.data.map = decodeURIComponent(dcs.getAttribute('map'))
    vaccineMacro.data.bounds = vaccineMacro.data.map.substring(vaccineMacro.data.map.indexOf("bounds=")+7);
    vaccineMacro.data.coords.bottomRight.x = Number(vaccineMacro.data.bounds.split(';')[0]);
    vaccineMacro.data.coords.bottomRight.y = Number(vaccineMacro.data.bounds.split(';')[3]);
    vaccineMacro.data.coords.topLeft.x = Number(vaccineMacro.data.bounds.split(';')[2]);
    vaccineMacro.data.coords.topLeft.y = Number(vaccineMacro.data.bounds.split(';')[1]);
  };
  vaccineMacro.data.delay = dcs.getAttribute('delay') && parseInt(dcs.getAttribute('delay')) || vaccineMacro.data.delay;
  vaccineMacro.data.timeout = dcs.getAttribute('timeout') && parseInt(dcs.getAttribute('timeout')) || vaccineMacro.data.timeout;
  vaccineMacro.data.choice = dcs.getAttribute('choice') && dcs.getAttribute('choice').split(',') || vaccineMacro.data.choice;
}

vaccineMacro.mounted().agreementCheck().then(res => res && res.init());
