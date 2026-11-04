# EMO.TYPE

Type it. Pull it. Feel it.

감정과 글자를 직접 만지는 Interactive Typography Playground. 넓은 아이보리 여백과 서로 다른 서체로 구성하고, 글자와 필수 컨트롤만 남긴 웹사이트입니다. Vite + Vanilla JavaScript + CSS를 사용하며 서버나 계정이 필요하지 않습니다.

## 실행

Node.js 20.19+ 또는 22.12+ 권장.

```sh
npm install
npm run dev
```

기본 주소는 http://localhost:5173 입니다. 다른 기기로 접속하려면 같은 네트워크에서 터미널에 표시되는 Network 주소를 사용합니다.

```sh
npm run build
npm run preview
```

빌드 결과물은 `dist/`에 생성됩니다.

## 플레이 방법

- 기본 문구는 `HOW DO YOU FEEL?`이며 한글·영문·이모지를 최대 80 UTF-16 코드 단위까지 입력할 수 있습니다. 긴 글은 최대 세 줄로 나누고 폭에 맞춰 축소합니다. 한글 음절과 이모지 조합을 보존하도록 grapheme 단위로 줄을 나눕니다.
- **JOY / ANGER / SADNESS / ANXIETY / CALM**은 도약·거친 흔들림·처짐·빠른 진동·호흡의 고유 움직임과 서로 다른 스프링 특성을 가집니다.
- **STRETCH X / STRETCH Y / FREE**를 선택하고 글자를 드래그합니다. 거리·속도·강도가 변형에 반영되고 놓으면 감정별 탄성으로 복원됩니다. 축 모드를 바꾸면 이전 변형은 초기화됩니다.
- **EMOTION INTENSITY** 0–100으로 움직임의 크기·속도·변형 민감도·반동을 조절합니다. 0에서는 자동 움직임이 멈추며 직접 변형은 가능합니다.
- **RANDOMIZE**는 입력 문구·감정·강도·모드를 유지하면서 글자 형태을 생성합니다. 이후 드래그를 놓으면 이 형태로 돌아옵니다.
- **RESET**은 문구·감정·모드·강도·배경를 모두 기본 상태로 돌립니다.
- **EXPORT PNG**는 현재 글자, 변형과 작품 배경을 2400 × 1440 PNG로 저장합니다. 메뉴·입력·슬라이더 등 컨트롤은 포함하지 않습니다. 작품 경계를 넘어간 부분은 잘립니다.

## 접근성과 모바일

- Pointer Events와 pointer capture로 마우스·터치·펜을 지원하며, 드래그 취소와 캡처 해제를 처리합니다. 작품 안에서는 드래그를 우선하며, 바깥에서 페이지를 스크롤할 수 있습니다.
- 글자는 Tab으로 포커스하고 방향키로 조작할 수 있습니다. 컨트롤에는 화면 낭독기용 레이블과 선택 상태가 제공됩니다.
- `prefers-reduced-motion: reduce`에서는 자동 애니메이션, 관성, 반동과 호버 모션을 끕니다. 직접 조작한 변형을 유지하므로 정적인 작품 제작과 저장도 가능합니다.
- 작은 화면에서는 컨트롤이 2열로 바뀝니다. 외부 Google Fonts는 UI에만 사용하며 로딩 실패 시 시스템 서체로 동작합니다. 작품은 한글을 지원하는 시스템 서체를 사용하여 SVG 내보내기를 안정적으로 유지합니다.

## 구조와 확장

- `src/main.js`: 상태와 컨트롤, Pointer Events, 프레임 루프
- `src/emotions.js`: 감정별 색상·물리 계수·움직임 설명
- `src/physics.js`: 축 제약·민감도·스프링·값 제한
- `src/typography.js`: grapheme 기반 줄 분할과 SVG 글자 레이아웃
- `src/export.js`: 작품 SVG 스냅샷 → Canvas → PNG
- `src/style.css`: 에디토리얼 레이아웃, 반응형 UI, 모션 감소 설정

현재 글자는 전체 그룹 단위로 안정적으로 변형합니다. 개별 글자 변형은 `typography.js`에서 grapheme마다 `<g>`를 생성하고 각 그룹에 physics 상태를 연결하는 방식으로 확장할 수 있습니다. 윤곽선·메시 변형은 별도의 폰트 파서 및 path 모듈로 추가할 수 있습니다.

## 검증

프로덕션 빌드, 실제 브라우저에서 한글 입력·감정 변경·글자 드래그·랜덤 구성·PNG 다운로드와 390px 모바일 레이아웃을 확인했습니다. 터치 하드웨어와 각 OS의 모든 대체 서체는 별도 실기기 검수가 필요합니다.

화면의 설명 문구와 주변 그래픽은 제거했습니다. ◐ 버튼으로 작품 배경을 전환하고, 컨트롤 오른쪽의 −/+ 버튼으로 조작 영역을 접거나 펼칠 수 있습니다.

## GitHub Pages 배포

`.github/workflows/deploy.yml`이 `main` 브랜치 변경 시 빌드하고 GitHub Pages에 배포합니다. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다. 최초 배포는 **Actions → Deploy EMO.TYPE to GitHub Pages → Run workflow**로도 실행할 수 있습니다.

`vite.config.js`의 상대 경로 설정으로 저장소 하위 경로에서도 JS와 CSS가 로드됩니다. 배포 상태와 최종 주소는 GitHub Actions의 배포 작업에서 확인할 수 있습니다.
