# 카카오 잔여백신 예약 [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fkimytsc%2Fcovid-rest-vaccine-macro&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
잔여백신 API로 남은 백신 수를 확인하고, 잔여백신이 있는 경우 예약 시도를 해줍니다.

## PC 이용방법
Chrome 브라우저에서만 테스트를 하였습니다. 타 브라우저에서도 이슈는 없을 것 같지만 되도록 크롬 브라우저를 실행해주세요.
1. [다음 홈페이지](https://www.daum.net/)에 접근하여 `카카오 계정으로 로그인`을 합니다.
1. [내 정보 확인](https://vaccine.kakao.com/api/v1/user)에 접근합니다.  
   만약, `{"error":"error occurred"}`가 보인다면, 로그아웃 후 다시 로그인을 시도해주세요.  
   `{"user":{"name":"나백신","status":"NORMAL","statusDate":null,"statusOrganization":null},"alarms":[],"reservations":[]}`와 같은 메세지가 보인다면 이어서 진행하시면 됩니다.
1. [내 정보 확인](https://vaccine.kakao.com/api/v1/user)에서 키보드의 `Command + Option + C`(Mac) 또는 `Control + Shift + C`(Windows, Linux, Chrome OS) 또는 `F12`를 눌러 `DevTools`창을 띄웁니다.
1. `DevTools`창에서 `Console`탭을 누릅니다.
1. [원하는 크기의 지도 좌표를 구하는 방법](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/kakao/macro.js#L18)을 참고하여 [내가 원하는 위치의 병원들](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/kakao/macro.js#L73)을 설정합니다.
1. 특정 백신만을 예약하고 싶다면, [choice](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/kakao/macro.js#L66)의 주석(`//`)을 제거합니다.
1. [설정한 소스](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/kakao/macro.js)를 복사한 후 `DevTools`창의 `Console`에 붙여넣고 실행시킵니다.
1. `DevTools`창을 끕니다.
1. 정말 간절히 원하면 스크립트가 나서서 도와준다.

## Mobile & PC 이용방법
Chrome 브라우저에서만 테스트를 하였습니다. 타 브라우저에서도 이슈는 없을 것 같지만 되도록 크롬 브라우저를 실행해주세요.
1. 아래의 소스를 복사하여 메모 어플 등을 활용하여 편집할 준비를 해줍니다.
    ~~~
    javascript:((my={
        map: "https://m.place.naver.com/rest/vaccine?x=127.1054100&y=37.3594909&bounds=127.1022772%3B37.3998888%3B127.1117132%3B37.4032979",
        delay: 1000,
        timeout: 3000,
        choice: [
            "VEN00013",/*화이자*/
            "VEN00014",/*모더나*/
          /*"VEN00015",/*아스트라제네카, 2021-08-09 기준 50세 이상만 신청 가능하여 주석처리, 필요시 '/*"VEN00015'의 '/*' 제거*/
          /*"VEN00016",/*얀센, 기본값에서 제거, 필요시 '/*"VEN00016'의 '/*' 제거*/
          /*"VEN00017",/*노바백스, 기본값에서 제거, 필요시 '/*"VEN00017'의 '/*' 제거*/
          /*"VEN00018",/*시노팜, 기본값에서 제거, 필요시 '/*"VEN00018'의 '/*' 제거*/
          /*"VEN00019",/*시노백, 기본값에서 제거, 필요시 '/*"VEN00019'의 '/*' 제거*/
          /*"VEN00020",/*스푸트니크V, 기본값에서 제거, 필요시 '/*"VEN00020'의 '/*' 제거*/
        ]
    }) => {
    fetch('https://raw.githubusercontent.com/kimytsc/covid-rest-vaccine-macro/main/kakao/macro.js')
    .then(res => res.text())
    .then(res => {
        var d=document
        , s=d.createElement('script');
        Object.keys(my).forEach(k=>{s.setAttribute(k, my[k])});
        s.innerHTML=res;
        d.getElementsByTagName('head')[0].appendChild(s);
    });
    })()
    ~~~
1. [잔여백신 지도](https://m.place.naver.com/rest/vaccine)에서 원하는 지역을 선택하고 `현 지도에서 검색`을 눌러줍니다.  
   그리고 변경된 `URL`을 복사하여 `복사한 소스`의 `map`을 바꿔줍니다.
1. 특정 백신만을 예약하고 싶다면, `복사한 소스`의 `choice`에서 특정 백신만 남기고 나머지를 제거합니다.  
   모두 제거한다면, 모든 백신을 대상으로 진행합니다.
1. `수정한 소스` 복사합니다.
1. [다음 홈페이지](https://m.daum.net/)에 접근하여 `카카오 계정으로 로그인`을 합니다.
   이미 `로그인`이 되어 있다면, 이어서 진행해주세요.
1. [내 정보 확인](https://vaccine.kakao.com/api/v1/user)에 접근합니다.  
   만약, `{"error":"error occurred"}`가 보인다면, 로그아웃 후 다시 로그인을 시도해주세요.  
   `{"user":{"name":"나백신","status":"NORMAL","statusDate":null,"statusOrganization":null},"alarms":[],"reservations":[]}`와 같은 메세지가 보인다면 이어서 진행하시면 됩니다.
1. Chrome 브라우저 주소창에 복사한 소스를 붙여넣고 실행시켜줍니다.  
   주의할 점은, 붙여넣을때 앞에 있는 `javascript:`가 없이 붙여넣어지므로, `javascript:`는 직접 입력한 후 붙여넣으시길 바랍니다.
1. 잔여백신 예약에 성공할 경우, `박수소리`와 Mobile은 `진동`이 추가로 울리도록 설정되어 있습니다.
1. 정말 간절히 원하면 스크립트가 나서서 도와준다.

## 주의사항
- 예약이 성공한 경우, 정지됩니다.
- 예약 시도가 반드시 성공 한다는 보장이 없습니다.
- 창을 하나만 띄워서 써도 충분합니다.
- 본 프로그램을 사용함으로 생기는 책임은 모두 사용자 본인에게 있습니다.

## 동작화면
![KAKAO 동작 및 결과 화면](https://raw.githubusercontent.com/kimytsc/covid-rest-vaccine-macro/resources/main/images/kakao/result.png)
