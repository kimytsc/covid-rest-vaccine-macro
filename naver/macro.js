/**
 * 신청현황 확인: https://v-search.nid.naver.com/reservation/me
 * 
 * 
 * 작업순서
 * 1. 새 창 또는 새 탭을 열고 "https://v-search.nid.naver.com/reservation/standby?orgCd=11351853&sid=19514421"에 들어간다.
 * 2. 1번창에서 F12를 눌러 DevTools 창을 띄운다
 * 3. 2번창에서 "Console"탭을 누른다.
 * 4. 1번의 페이지가 본인인증 단계라면, 본인인증을 하고 예약신청까지 넘어간다
 *    만약, 예약신청 페이지에서 개인정보취급(?) 체크박스가 떠있다면, 아래의 명령어를 Console에 실행해준 후 다시 1번으로 넘어간다.
      $('#reservation_confirm').addClass('on')[0].click();
 * 5. "원하는 크기의 지도 좌표를 구하는 방법"을 참고하여 내가 원하는 위치의 병원들을 설정한다.
 * 6. 아래의 소스를 전부 복사해서 붙여넣고 실행시킨다.
 * 7. 간절히 바라면 스크립트가 나서서 도와준다.
 * 
 * 
 * 원하는 크기의 지도 좌표를 구하는 방법
 * 1. "https://m.place.naver.com/rest/vaccine?vaccineFilter=used" 에서 원하는 위치, (적당한) 크기를 만든다.
 * 2. "현 지도에서 검색"을 누른다.
 * 3. URL이 아래의 예제와 같이 바뀌는걸 확인한다.
 *    ex) https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=126.9015361&y=37.4858157&bounds=126.8770000%3B37.4560000%3B126.9260000%3B37.5170000
 * 4. url을 다 복사하거나 bounds 부분만 복사한다.
 * 5. 복사한 값을 가지고 아래 소스 중 "bounds:" 부분의 값을 변경한다.
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
}());

var vaccineMacro = {
  data: {
    delay: 1000, // milliseconds
    timeout: 3000,
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
    bounds: "https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=126.9015361&y=37.4858157&bounds=126.8770000%3B37.4560000%3B126.9260000%3B37.5170000",
    // bounds: "126.8770000%3B37.4560000%3B126.9260000%3B37.5170000",
    // bounds: "126.8770000;37.4560000;126.9260000;37.5170000",
    // sampleOrganizations: [{
    //   id: "19514283",
    //   name: "명소아청소년과의원",
    //   phone: "02-0000-0000",
    //   roadAddress: "서울 영등포구 도림로38길 4",
    //   x: "126.8971880",
    //   y: "37.4926510",
    //   vaccineQuantity: {
    //     totalQuantity: 0,
    //     startTime: "0900",
    //     endTime: "1900",
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
  mounted() {
    vaccineMacro.data.bounds = vaccineMacro.data.bounds.indexOf('bounds=') !== -1 && vaccineMacro.data.bounds.substring(vaccineMacro.data.bounds.indexOf("bounds=")+7) || vaccineMacro.data.bounds;

    $('.h_title').html(`<span class="accent"><span id="organizations">0</span>개 리스트에서 잔여백신</span> 예약시도중`);
    $('.info_box:eq(0) .info_box_inner').html(`<div class="info_item">
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
    </div>`);
    $('.info_box:eq(1) .info_box_inner').html(`<div class="info_item">
      <strong class="info_title">예약시도 위치 확인</strong>
      <div class="error">
        <img style="width:100%" src="${ vaccineMacro.mapImage() }">
      </div>
    </div>`);

    if ($('.agree_box').length) {
      // 개인정보 수집 및 제공 전체동의 제거
      fetch(`/reservation/progress?key=${ $('#reservation_confirm').data('key') }`, {
        method: 'GET',
      })
      .then(res => res.text())
      .finally(() => $('.agree_box').remove())
    }

    return vaccineMacro;
  },
  async init(start) {
    vaccineMacro.log('nowUpdate', new Date().toLocalDateTimeString());
    var delayCheck = new Date();
    var signal = new AbortController();
    var abort = setTimeout(() => signal.abort(), vaccineMacro.data.timeout);
    start = start || 0;

    await vaccineMacro.graphql(start, signal)
    .then(res => res.shift())
    .then(res => {
      vaccineMacro.log('lastUpdate', new Date(res.data.rests.businesses.vaccineLastSave).toLocalDateTimeString())
      vaccineMacro.log('organizations', res.data.rests.businesses.total || 0)
      start = start + res.data.rests.businesses.items.length < res.data.rests.businesses.total ? start + res.data.rests.businesses.items.length : 0;
      return res;
    })
    .then(res => res.data.rests.businesses.items.filter(item => item.vaccineQuantity && item.vaccineQuantity.totalQuantity > 0))
    .then(res => vaccineMacro.data.sampleOrganizations || res)
    .then(res => {
      while (bussiness = res.shift()) {
        let hasQuantity = false;
        business.vaccineQuantity.list.forEach(item => {
          if (item.quantity > 0 && item.vaccineType !== 'AZ') {
            hasQuantity = true;
          }
        });

        hasQuantity && setTimeout(vaccineMacro.standby, 1, bussiness);
      }
    })
    .finally(() => {
      if (vaccineMacro.data.reservation) {
        vaccineMacro.data.bounds = `${ vaccineMacro.data.reservation.x };${ vaccineMacro.data.reservation.y };${ vaccineMacro.data.reservation.x };${ vaccineMacro.data.reservation.y }`;

        vaccineMacro.log('lastResult', '축하합니다! 잔여백신 예약에 성공하셨습니다!');
        vaccineMacro.log('reservationInfo', ((obj) => {
          let info = '';
          for(const d in obj) {
            info += `<dt class="term">${ d }</dt><dd class="desc"><span class="text">${ obj[d] }</span></dd>`
          }
          return info;
        })({
          '병원이름': vaccineMacro.data.reservation.name,
          '전화번호': vaccineMacro.data.reservation.phone,
          '병원주소': vaccineMacro.data.reservation.roadAddress,
          '운영종료': `오늘 ${ vaccineMacro.data.reservation.vaccineQuantity.endTime } 까지 (${ new Date().toLocaleDateString() } ${ (['일','월','화','수','목','금','토',])[new Date().getDay()] })`,
          '병원위치': `<img src="${ vaccineMacro.mapImage(15) }">
                      <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FA4943" style="width:48px;height:48px;position:absolute;left:201px;top:177px;">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M12 2c3.86 0 7 3.14 7 7 0 5.25-7 13-7 13S5 14.25 5 9c0-3.86 3.14-7 7-7zm-1.53 12L17 7.41 15.6 6l-5.13 5.18L8.4 9.09 7 10.5l3.47 3.5z"/>
                      </svg>`
        }));

        $('#reservation_confirm').remove();
        $('.process_item:eq(2)').addClass('on')

        setTimeout(() => {location.href = `/reservation/success?key=${ vaccineMacro.data.reservation.key }`}, 8000);

        if (window && window.navigator && window.navigator.vibrate) {
          // mobile에서 성공시 진동 알림 추가
          window.navigator.vibrate([500, 250, 500, 250, 500, 250, 500, 250, 500]);
        }

        // sound 출처: https://mixkit.co/free-sound-effects/clap/
        (new Audio("https://raw.githubusercontent.com/kimytsc/covid-rest-vaccine-macro/resources/main/sounds/mixkit-conference-audience-clapping-strongly-476.wav")).play()
      } else {
        // 아직이군요.. 더 돌려볼까요?
        delayCheck = vaccineMacro.data.delay - (new Date() - delayCheck);
        setTimeout(vaccineMacro.init, delayCheck < 0 ? 1 : delayCheck, start);
      }
    });

    clearTimeout(abort);

  },
  graphql(start, signal) {
    return fetch(`https://api.place.naver.com/graphql`, {
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
            start: start || 0,
            display: 100,
            deviceType: "mobile",
            bounds: decodeURIComponent(vaccineMacro.data.bounds) // 2021-07-26 검색된 병원 198개
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
                phone
                roadAddress
                x
                y
                vaccineQuantity {
                  totalQuantity
                  startTime
                  endTime
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
      signal: signal && signal.signal,
    })
    .then(res => res.json())
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
            "아스트라제네카": "VEN00015",
            "얀센": "VEN00016",
            "노바백스": "VEN00017",
            "시노팜": "VEN00018",
            "시노백": "VEN00019",
            "스푸트니크V": "VEN00020",
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
          vaccineMacro.data.reservation = Object.assign({datetime: new Date().toLocalDateTimeString(), key: key}, bussiness);
          break;
        case 'SOLD_OUT':
        default:
          break;
      }
      vaccineMacro.log('lastResult', `[${ bussiness.name }] 예약시도 실패`);
    })
    .catch(e => {
      console.log(e);
      // error
    })
  },
  log(type, text) {
    document.getElementById(`${ type }`).innerHTML = text;
  },
  mapImage(level) {
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    level = level || 13;

    var bounds = decodeURIComponent(vaccineMacro.data.bounds).split(';').map(p => Number(p))
      , x = ((bounds[0] + bounds[2]) / 2).toFixed(7)
      , y = ((bounds[1] + bounds[3]) / 2).toFixed(7)
      , R = 6371 // Radius of the earth in km
      , dLon, dLat, a, c, width, height;
  
    dLat = deg2rad(bounds[2]-bounds[0]);
    a = Math.sin(dLat/2) * Math.sin(dLat/2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    width = ((R * c * 100) || 450).toFixed(0);
  
    dLon = deg2rad(bounds[3]-bounds[1]);
    a = Math.cos(deg2rad(x)) * Math.cos(deg2rad(x)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    height = ((R * c * 200) || 450).toFixed(0);
  
    return `https://simg.pstatic.net/static.map/v2/map/staticmap.bin?center=${ x }%2C${ y }&level=${ level }&format=jpg&scale=1&dataversion=162.69&caller=naver_mstore&w=${ width }&h=${ height }`;
  }
}

if (dcs = document.currentScript) {
  if (dcs.getAttribute('map')) {
    vaccineMacro.data.map = decodeURIComponent(dcs.getAttribute('map'))
    vaccineMacro.data.bounds = vaccineMacro.data.map.substring(vaccineMacro.data.map.indexOf("bounds=")+7);
  };
  vaccineMacro.data.delay = dcs.getAttribute('delay') && parseInt(dcs.getAttribute('delay')) || vaccineMacro.data.delay;
  vaccineMacro.data.timeout = dcs.getAttribute('timeout') && parseInt(dcs.getAttribute('timeout')) || vaccineMacro.data.timeout;
  vaccineMacro.data.choice = dcs.getAttribute('choice') && dcs.getAttribute('choice').split(',') || vaccineMacro.data.choice;
}

vaccineMacro.mounted().init();
