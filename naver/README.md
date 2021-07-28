# 네이버 잔여백신 예약
잔여백신 API로 남은 백신 수를 확인하고, 잔여백신이 있는 경우 예약 시도를 해줍니다.

## 이용방법
1. Chrome 브라우저에서만 테스트를 하였습니다. 타 브라우저에서도 이슈는 없을 것 같지만 되도록 크롬 브라우저를 실행해주세요.
1. [네이버 홈페이지](https://www.naver.com/)에 접근하여 `NAVER 로그인`을 합니다.
1. [예약 신청 페이지](https://v-search.nid.naver.com/reservation/standby?orgCd=41376633&sid=1085568538)에 접근합니다.  
   만약, `본인인증`이 떴다면 `본인인증`을 진행해주세요.  
   `예약신청`이 뜬다면 이어서 진행하시면 됩니다.
1. [예약 신청 페이지](https://v-search.nid.naver.com/reservation/standby?orgCd=41376633&sid=1085568538)에서 키보드의 `Command + Option + C`(Mac) 또는 `Control + Shift + C`(Windows, Linux, Chrome OS) 또는 `F12`를 눌러 `DevTools`창을 띄웁니다.
1. `DevTools`창에서 `Console`탭을 누릅니다.  
   만약, [예약 신청 페이지](https://v-search.nid.naver.com/reservation/standby?orgCd=41376633&sid=1085568538) 창에 `개인정보 수집 및 제공 전체동의(필수)`가 떠있다면, 전체동의 체크박스를 설정하신 후 `DevTools`창의 `Console`탭에서 [개인정보 수집 및 제공 전체동의 제거](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/naver/macro.js#L12)를 실행시켜주고 다시 [예약 신청 페이지](https://v-search.nid.naver.com/reservation/standby?orgCd=41376633&sid=1085568538)에 다시 접근합니다.
1. [원하는 크기의 지도 좌표를 구하는 방법](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/naver/macro.js#L18)을 참고하여 [내가 원하는 위치의 병원들](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/naver/macro.js#L92)을 설정합니다.
1. 특정 백신만을 예약하고 싶다면, [choice](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/naver/macro.js#L85)의 주석(`//`)을 제거합니다.
1. [설정한 소스](https://github.com/kimytsc/covid-rest-vaccine-macro/blob/main/naver/macro.js)를 복사한 후 `DevTools`창의 `Console`에 붙여넣고 실행시킵니다.
1. `DevTools`창을 끕니다.
1. 정말 간절히 원하면 매크로가 나서서 도와준다.

## 주의사항
- 예약이 성공한 경우, 예약 성공 페이지가 새창으로 뜨고 정지됩니다.
- 예약 시도가 반드시 성공 한다는 보장이 없습니다.
- 창을 하나만 띄워서 써도 충분합니다.
- 본 프로그램을 사용함으로 생기는 책임은 모두 사용자 본인에게 있습니다.
