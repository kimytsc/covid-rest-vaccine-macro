# 카카오 잔여백신 예약
잔여백신 API로 남은 백신 수를 확인하고, 잔여백신이 있는 경우 예약 시도를 해줍니다.

## 이용방법
1. Chrome 브라우저에서만 테스트를 하였습니다. 타 브라우저에서도 이슈는 없을 것 같지만 되도록 크롬 브라우저를 실행해주세요.
1. 아래의 코드를 `복사`하여 `메모장`이나 `에디터`에 붙여줍니다.
~~~
javascript:((my={
  map: "https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=127.1054100&y=37.3594909&bounds=127.1022772%3B37.3998888%3B127.1117132%3B37.4032979",
  delay: 500,
  timeout: 3000,
  choice: [
    "VEN00013",/*화이자*/
    "VEN00014",/*모더나*/
    "VEN00015",/*아스트라제네카*/
    "VEN00016",/*얀센*/
  ]
}) => {
  fetch('https://raw.githubusercontent.com/kimytsc/covid-rest-vaccine-macro/bookmark/kakao/macro.js')
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

1. [예약을 원하는 지역 고르기](https://github.com/kimytsc/covid-rest-vaccine-macro/tree/bookmark/kakao#예약을-원하는-지역-고르기)를 참고하여 코드의 `map:` 부분을 수정해줍니다.
1. 특정 백신만을 예약하고 싶다면, `choice:` 목록을 제거합니다.  
   모두 다 제거할 경우, 모든 백신에 대해 신청하게 됩니다.
1. 수정이 끝난 코드를 복사한 후, 브라우저의 `북마크` 또는 `즐겨찾기`에 추가하여 주세요. 복사한 코드는 URL에 넣으면 됩니다.
1. `잔여백신 예약을 시도하겠습니다.` 메세지가 뜰때까지 추가한 `북마크` 또는 `즐겨찾기`를 클릭해주세요.  
   만약, 로그인 페이지가 떴다면 `로그인`을 하고 다시 추가한 `북마크` 또는 `즐겨찾기`를 클릭해주세요.  
   만약, 본인인증 페이지가 떴다면 `본인인증`을 진행하고 다시 추가한 `북마크` 또는 `즐겨찾기`를 클릭해주세요.
1. 정말 간절히 원하면 매크로가 나서서 도와준다.



## 예약을 원하는 지역 고르기
 1. "https://m.place.naver.com/rest/vaccine?vaccineFilter=used" 에서 원하는 위치, (적당한) 크기를 만듭니다.
 2. "현 지도에서 검색"을 누릅니다.
 3. URL이 아래의 예제와 같이 바뀌는걸 확인합니다.  
    ex) https://m.place.naver.com/rest/vaccine?vaccineFilter=used&x=127.1054288&y=37.3594909&bounds=127.1022772%3B37.3577853%3B127.1085804%3B37.3611964
 4. URL을 복사하여 코드의 `map:` 값을 변경해줍니다.


## 주의사항
- 예약이 성공한 경우, 예약 성공 페이지가 뜨고 정지됩니다.
- 예약 시도가 반드시 성공 한다는 보장이 없습니다.
- 창을 하나만 띄워서 써도 충분합니다.
- 본 프로그램을 사용함으로 생기는 책임은 모두 사용자 본인에게 있습니다.
