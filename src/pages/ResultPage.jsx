import React, { useEffect } from "react";
import  "../styles/ResultPage.css";
import Header from '../components/Header';

const ResultPage = () => {
	const { kakao } = window;

	useEffect(() => {
    //마커를 담을 배열
    var markers = [];
    
    //지도를 표시
    var mapContainer = document.getElementById("map"),
      mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), //지도의 중심좌표
        level: 3, 
      };

    //지도 생성
    var map = new kakao.maps.Map(mapContainer, mapOption);

    //지도 확대, 축소를 제어할 수 있는 줌 컨트롤 생성
    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    //장소 검색 객체 생성
    var ps = new kakao.maps.services.Places(); 

    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 }); //검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우 생성

    /*const searchForm = document.querySelector('.form');
    searchForm.addEventListener('submit', function(e){
      e.preventDefault();
      searchPlaces();
    })

    function searchPlaces() {
      var keyword = document.getElementById('keyword').value;
      
      if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
      }

      ps.keywordSearch(keyword, placesSearchCB); //장소 검색 객체를 통해 키워드로 장소 검색을 요청함
    } 검색 가능 버전*/

    var markerPosition  = new kakao.maps.LatLng(37.557553, 126.955197); //<-계산한 중간 지점 좌표
    var middleMarker = new kakao.maps.Marker({
    position: markerPosition
    });
    middleMarker.setMap(map);

    searchPlaces();
    function searchPlaces() {
      var keyword = "맛집";
      var options = {
        location: markerPosition,
        radius: 10000,
        };

      // 장소검색 객체를 통해 키워드로 장소검색을 요청
      ps.keywordSearch(keyword, placesSearchCB, options);
    }

    // 장소 검색 완료 시 호출되는 콜백함수
    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면 검색 목록과 마커 보여줌
        displayPlaces(data);
        // 페이지 번호를 보여줌
        displayPagination(pagination);
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 존재하지 않습니다.");
        return;
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert("검색 결과 중 오류가 발생했습니다.");
        return;
      }
    }

    // 검색 결과 목록과 마커를 표출하는 함수
    function displayPlaces(places) {
      var listEl = document.getElementById("placesList"),
        menuEl = document.getElementById("menu_wrap"),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds(),
        listStr = "";

      removeAllChildNods(listEl); //검색 결과 목록에 추가된 항목들을 제거
      removeMarker(); //지도에 표시되고 있는 마커를 제거

      for (var i = 0; i < places.length; i++) {
        //마커를 생성하고 지도에 표시
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
          marker = addMarker(placePosition, i),
          itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성

        //검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해 LatLngBounds 객체에 좌표를 추가
        bounds.extend(placePosition);

        //마커와 검색결과 항목에 mouseover 했을때 해당 장소 인포윈도우에 장소명을 표시
        (function (marker, title) {
          kakao.maps.event.addListener(marker, "mouseover", function () {
            displayInfowindow(marker, title);
          });

          kakao.maps.event.addListener(marker, "mouseout", function () {
            infowindow.close();
          });

          itemEl.onmouseover = function () {
            displayInfowindow(marker, title);
          };

          itemEl.onmouseout = function () {
            infowindow.close();
          };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
      }

      //검색 결과 항목들을 검색 결과 목록 Element에 추가
      listEl.appendChild(fragment);
      menuEl.scrollTop = 0;

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정
      map.setBounds(bounds);
    }

    //검색결과 항목을 Element로 반환하는 함수
    function getListItem(index, places) {
      var el = document.createElement('li'),
      itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                  '<div class="info">' +
                  '   <h5>' + places.place_name + '</h5>';
  
      if (places.road_address_name) {
          itemStr += '    <span>' + places.road_address_name + '</span>' +
                      '   <span class="jibun gray">' +  places.address_name  + '</span>';
      } else {
          itemStr += '    <span>' +  places.address_name  + '</span>'; 
      }
                   
        itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                  '</div>';           
  
      el.innerHTML = itemStr;
      el.className = 'item';
  
      return el;
  }

    //마커를 생성하고 지도 위에 마커를 표시하는 함수
    function addMarker(position, idx, title) {
      var imageSrc =
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png",
        imageSize = new kakao.maps.Size(36, 37), // 마커 이미지 크기
        imgOptions = {
          spriteSize: new kakao.maps.Size(36, 691), //스프라이트 이미지의 크기
          spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), //스프라이트 이미지 중 사용할 영역의 좌상단 좌표
          offset: new kakao.maps.Point(13, 37), //마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          imageSize,
          imgOptions
        ),
        marker = new kakao.maps.Marker({
          position: position, //마커의 위치
          image: markerImage,
        });

      marker.setMap(map); //지도 위에 마커를 표출
      markers.push(marker); //배열에 생성된 마커를 추가

      return marker;
    }

    // 지도 위에 표시되고 있는 마커를 모두 제거
    function removeMarker() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }

    // 검색결과 목록 하단에 페이지번호를 표시는 함수
    function displayPagination(pagination) {
      var paginationEl = document.getElementById("pagination"),
        fragment = document.createDocumentFragment(),
        i;

      // 기존에 추가된 페이지번호를 삭제
      while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
      }

      for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement("a");
        el.href = "#";
        el.innerHTML = i;

        if (i === pagination.current) {
          el.className = "on";
        } else {
          el.onclick = (function (i) {
            return function () {
              pagination.gotoPage(i);
            };
          })(i);
        }

        fragment.appendChild(el);
      }
      paginationEl.appendChild(fragment);
    }

    //검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수
    //인포윈도우에 장소명을 표시
    function displayInfowindow(marker, title) {
      var content ='<div style="padding:5px;z-index:1;color:black">' + title + "</div>";

      infowindow.setContent(content);
      infowindow.open(map, marker);
    }

    // 검색결과 목록의 자식 Element를 제거하는 함수
    function removeAllChildNods(el) {
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
      }
    }
  }, []);

  return (
    <div>
      <Header />
      <div className="map_wrap">
        <div id="map" style={{ width: '100%', height: '90vh', position: 'absolute', overflow: 'hidden' }}></div>
          <div id="menu_wrap" className="bg_white">
          <hr />
          <ul id="placesList"></ul>
          <div id="pagination"></div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

/*
<div className="map_wrap">
    <div id="map" style={{ width: '100%', height: '97vh', position: 'absolute', overflow: 'hidden' }}></div>
      <div id="menu_wrap" className="bg_white">
        <div className="option">
          <div>
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" defaultValue="" id="keyword" placeholder="장소를 검색해주세요." size="25" /> 
              <button type="submit">검색하기</button> 
            </form>
          </div>
        </div>
        <hr />
        <ul id="placesList"></ul>
      <div id="pagination"></div>
    </div>
  </div>
  */