# 카카오 잔여백신 예약 [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fkimytsc%2Fcovid-rest-vaccine-macro&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
잔여백신 API로 남은 백신 수를 확인하고, 잔여백신이 있는 경우 예약 시도를 해줍니다.

## PC 이용방법
2021년 8월 19일 00시부로 웹 로그인 연동이 되지 않아 확인중이며, 현 버전에서 PC의 이용이 불가능합니다.  
단, 특정한 과정을 수행하면 가능하지만 조금 더 검증한 후 소스로 변환하도록 노력하겠습니다.

## Mobile(iOS)
2021년 8월 19일 00시부로 웹 로그인 연동이 되지 않아 확인중이며, 현 버전에서 iOS의 이용이 불가능합니다.

## Mobile(Android)
2021년 8월 19일 00시부로 웹 로그인 연동 이슈로 인해, 카카오톡의 브라우저를 활용하여 우회하는 방법입니다.
1. `나와의 채팅`을 열고, `https://vaccine-map.kakao.com/api/v1/user` 메세지를 먼저 남겨둡니다.
1. 아래의 소스를 복사하여 메모 어플 등을 활용하여 편집할 준비를 해줍니다.
    ~~~
    javascript:((my={
        map: "https://m.place.naver.com/rest/vaccine?x=127.1054100&y=37.3594909&bounds=127.1022772%3B37.3998888%3B127.1117132%3B37.4032979",
        delay: 1000,
        timeout: 3000,
        choice: [
            "VEN00013",/*화이자, 2021-08-17 기준 18세 이상(2003.12.31 이전 출생자)만 신청 가능*/
            "VEN00014",/*모더나, 2021-08-17 기준 18세 이상(2003.12.31 이전 출생자)만 신청 가능*/
          /*"VEN00015",/*아스트라제네카, 2021-08-17 기준 30세 이상(1991.12.31 이전 출생자)만 신청 가능하여 주석처리, 필요시 '/*"VEN00015'의 '/*' 제거*/
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
1. `카카오톡`의 `나와의 채팅`에 적어놓은 링크를 누르고 `본인의 이름`이 노출되는 것을 확인합니다.  
   만약, 이름이 노출되지 않고 `error`라는 단어가 보인다면 `카카오 뷰`의 `잔여백신`에 접근하신 후 `목록보기` 또는 `신청내역` 또는 `지도상에 표시된 병원`을 눌러 준 후 다시 `나와의 채팅`으로 돌아가 적어놓은 링크를 눌러봅니다.  
   그래도 보이지 않는다면, `나와의 채팅`에 `https://accounts.kakao.com/login?continue=https%3A%2F%2Fvaccine-map.kakao.com%2Fapi%2Fv1%2Fuser` 메세지를 보낸 후 눌러서 로그인을 시도해봅니다.
1. `카카오톡 브라우저` 주소창에 복사한 소스를 붙여넣고 실행시켜줍니다.  
   다만, 이전과는 다르게 붙여넣을때 앞에 있는 `javascript:`가 존재하므로 확인할 필요 없이 바로 실행시켜줍니다.
1. 잔여백신 예약에 성공할 경우, `박수소리`와 Mobile은 `진동`이 추가로 울리도록 설정되어 있습니다.  
1. 정말 간절히 원하면 스크립트가 나서서 도와준다.

## 주의사항
- 예약이 성공한 경우, 정지됩니다.
- 예약 시도가 반드시 성공 한다는 보장이 없습니다.
- 창을 하나만 띄워서 써도 충분합니다.
- 본 프로그램을 사용함으로 생기는 책임은 모두 사용자 본인에게 있습니다.

## 동작화면
![KAKAO 동작 및 결과 화면](https://raw.githubusercontent.com/kimytsc/covid-rest-vaccine-macro/resources/main/images/kakao/result.png)
