import React from 'react';
import { Link } from 'react-router-dom';
import './styles/footer.css';

/**
 * GeekFlex 푸터 컴포넌트
 * 
 * 모든 푸터 관련 컴포넌트를 하나로 통합
 */
const Footer = () => {
  // 푸터 링크 데이터
  const links = [
    {
      id: 'about',
      label: '사용정보',
      to: '/about',
      type: 'internal',
    },
    {
      id: 'privacy',
      label: '개인정보 처리방침',
      to: '/privacy',
      type: 'internal',
    },
    {
      id: 'terms',
      label: '이용약관',
      to: '/terms',
      type: 'internal',
    },
    {
      id: 'contact',
      label: '사이트 문의',
      href: 'mailto:adam9e96@gmail.com',
      type: 'external',
      ariaLabel: '사이트 문의 이메일',
    },
  ];

  return (
    <footer role="contentinfo" className="geekflex-footer">
      <div className="geekflex-footer__container">
        <div className="geekflex-footer__bottom">
          <div className="geekflex-footer__links">
            {links.map((link, index) => (
              <React.Fragment key={link.id}>
                {link.type === 'external' ? (
                  <a
                    href={link.href}
                    className="geekflex-footer__link"
                    aria-label={link.ariaLabel || link.label}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.to} className="geekflex-footer__link">
                    {link.label}
                  </Link>
                )}
                {index < links.length - 1 && (
                  <span className="geekflex-footer__divider" aria-hidden="true">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
