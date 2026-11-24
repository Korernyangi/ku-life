import { ENDINGS } from '../game/endings.js';
import { getEndingStatRows, showEndingProfile } from './ending-profile.js';

export function showEndingScreen(screen, result, state, archive) {
  const { ending, info, route, score, stats, semester } = result;
  const { isNew, saved } = archive.unlock(ending);
  screen.innerHTML = `
    <section class="ending-report" aria-labelledby="ending-title">
      <div class="ending-banner">
        <div class="ending-banner-content">
          <p class="ending-kind"></p>
          <h1 id="ending-title" tabindex="-1"></h1>
          <p class="ending-description"></p>
        </div>
        <span class="ending-icon" aria-hidden="true"></span>
      </div>
      <div class="ending-report-body">
        <div class="ending-score">
          <div>
            <h2>토탈 스코어</h2>
            <p class="ending-score-total"><strong>${score.total.toLocaleString('ko-KR')}</strong> <span>/ ${score.max.toLocaleString('ko-KR')}</span></p>
          </div>
          <dl>
            <div><dt>스탯 점수</dt><dd>${score.stats} / ${score.statsMax}</dd></div>
            <div><dt>엔딩 보너스</dt><dd>+${score.bonus} / ${score.bonusMax}</dd></div>
          </dl>
        </div>
        <dl class="ending-stats"></dl>
        <div class="ending-decision" hidden>
          <h2>마지막으로 고른 선택</h2>
          <p class="ending-route"></p>
          <p class="ending-reason"></p>
        </div>
        <p class="ending-discovery" role="status"></p>
        <div class="ending-actions">
          <button type="button" class="ending-primary view-profile">프로필 보기</button>
          <button type="button" class="view-archive">엔딩 도감</button>
          <button type="button" class="btn-restart">시작 화면으로</button>
        </div>
      </div>
    </section>
  `;

  const heading = screen.querySelector('h1');
  heading.textContent = info.title;
  screen.querySelector('.ending-kind').textContent = `${info.special ? '스페셜' : '기본'} 엔딩 · ${ending === 'dropout' ? `${semester}학기에서 마침` : '졸업 후 이야기'}`;
  screen.querySelector('.ending-description').textContent = info.desc;
  screen.querySelector('.ending-icon').textContent = info.icon;
  screen.querySelector('.ending-stats').replaceChildren(...getEndingStatRows(stats).map(([label, value]) => {
    const item = document.createElement('div');
    const term = document.createElement('dt');
    const definition = document.createElement('dd');
    term.textContent = label;
    definition.textContent = value;
    item.append(term, definition);
    return item;
  }));

  if (route && ending !== 'dropout') {
    screen.querySelector('.ending-decision').hidden = false;
    screen.querySelector('.ending-route').textContent = route.text;
    const target = ENDINGS[route.id];
    const missed = target && ending !== route.id && (ending === 'ordinary' || ending === 'employee');
    screen.querySelector('.ending-reason').textContent = missed
      ? `선택한 진로의 조건에 도달하지 못했습니다. ${target.hint}`
      : info.hint;
  }

  const discovery = screen.querySelector('.ending-discovery');
  if (!saved) discovery.textContent = '브라우저 설정으로 인해 도감에 영구 저장하지 못했습니다.';
  else if (isNew) discovery.textContent = '새로운 엔딩을 도감에 등록했어요!';
  else discovery.hidden = true;

  screen.querySelector('.view-profile').onclick = () => showEndingProfile(screen, result, state);
  screen.querySelector('.view-archive').onclick = () => archive.open();
  heading.focus({ preventScroll: true });
}
