import React from "react";
import "../../styles/footer/privacy.css";

/**
 * 개인정보 처리방침 페이지 컴포넌트
 */
const Privacy = () => {
  return (
    <div className="privacy-page">
      <header className="privacy-page__header">
          <h1 className="privacy-page__title">개인정보 처리방침</h1>
          <p className="privacy-page__subtitle">최종 수정일: 2025-11-12</p>
        </header>

        <main className="privacy-page__content">
          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">1. 개인정보의 처리 목적</h2>
            <p className="privacy-page__text">
              GeekFlex는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의
              목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법
              제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증,
                회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적
              </li>
              <li className="privacy-page__list-item">
                재화 또는 서비스 제공: 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증
              </li>
              <li className="privacy-page__list-item">
                마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보
                제공 및 참여기회 제공
              </li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">2. 개인정보의 처리 및 보유기간</h2>
            <p className="privacy-page__text">
              GeekFlex는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
              동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이
                진행중인 경우에는 해당 수사·조사 종료 시까지)
              </li>
              <li className="privacy-page__list-item">
                재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료 시까지
              </li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">3. 처리하는 개인정보의 항목</h2>
            <p className="privacy-page__text">
              GeekFlex는 다음의 개인정보 항목을 처리하고 있습니다:
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                필수항목: 아이디, 비밀번호, 닉네임, 이메일, 생년월일
              </li>
              <li className="privacy-page__list-item">선택항목: 자기소개, 프로필 이미지</li>
              <li className="privacy-page__list-item">
                자동 수집 항목: IP주소, 쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록
                등
              </li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">4. 개인정보의 제3자 제공</h2>
            <p className="privacy-page__text">
              GeekFlex는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의
              경우에는 예외로 합니다:
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">정보주체로부터 별도의 동의를 받은 경우</li>
              <li className="privacy-page__list-item">법령에 특별한 규정이 있는 경우</li>
              <li className="privacy-page__list-item">
                정보주체의 생명이나 신체의 이익을 보호하기 위하여 필요한 경우
              </li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">5. 개인정보처리의 위탁</h2>
            <p className="privacy-page__text">
              GeekFlex는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고
              있습니다.
            </p>
            <p className="privacy-page__text">현재 개인정보 처리업무를 위탁하고 있지 않습니다.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">6. 정보주체의 권리·의무 및 행사방법</h2>
            <p className="privacy-page__text">
              정보주체는 GeekFlex에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수
              있습니다:
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">개인정보 처리정지 요구권</li>
              <li className="privacy-page__list-item">개인정보 열람요구권</li>
              <li className="privacy-page__list-item">개인정보 정정·삭제요구권</li>
              <li className="privacy-page__list-item">개인정보 처리정지 요구권</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">7. 개인정보의 파기</h2>
            <p className="privacy-page__text">
              GeekFlex는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을
              때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">8. 개인정보 보호책임자</h2>
            <p className="privacy-page__text">
              GeekFlex는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고
              있습니다.
            </p>
            <div className="privacy-page__contact">
              <p className="privacy-page__contact-item">
                <strong>이메일:</strong> adam9e96@gmail.com
              </p>
            </div>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">9. 개인정보 처리방침 변경</h2>
            <p className="privacy-page__text">
              이 개인정보 처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의
              추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할
              것입니다.
            </p>
          </section>
        </main>
    </div>
  );
};

export default Privacy;
