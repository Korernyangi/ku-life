import * as THREE from 'three';

/**
 * 카메라 컨트롤러 - 직교 카메라, 등각 시점, 부드러운 이동
 */
export class CameraController {
  constructor(camera, renderer, options = {}) {
    this.camera = camera;
    this.renderer = renderer;
    this.target = new THREE.Vector3(0, 0, 0);

    // 카메라 설정
    this.distance = options.distance || 25;
    this.angle = options.angle || Math.PI / 4; // 45도
    this.height = options.height || 15;
    this.minDistance = options.minDistance || 10;
    this.maxDistance = options.maxDistance || 40;

    // 부드러운 이동
    this.lerpFactor = options.lerpFactor || 0.08;
    this.targetLerpFactor = options.targetLerpFactor || 0.1;

    // 마우스 회전
    this.enableMouseRotation = options.enableMouseRotation !== false;
    this.mouseSensitivity = options.mouseSensitivity || 0.005;
    this.autoRotate = options.autoRotate || false;
    this.autoRotateSpeed = options.autoRotateSpeed || 0.1;

    // 현재 상태
    this.currentAngle = this.angle;
    this.currentDistance = this.distance;
    this.currentHeight = this.height;
    this.currentTarget = this.target.clone();

    // 마우스 상태
    this.mouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.initEventListeners();
    this.updateCamera();
  }

  initEventListeners() {
    // 마우스 회전
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      if (!this.enableMouseRotation) return;
      if (e.button !== 0) return; // 좌클릭만
      this.mouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.renderer.domElement.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.mouseDown || !this.enableMouseRotation) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.currentAngle -= dx * this.mouseSensitivity;
      this.currentHeight = THREE.MathUtils.clamp(
        this.currentHeight - dy * this.mouseSensitivity * 10,
        5, 30
      );
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
      this.renderer.domElement.style.cursor = 'grab';
    });

    // 휠 줌
    this.renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.currentDistance = THREE.MathUtils.clamp(
        this.currentDistance + e.deltaY * 0.02,
        this.minDistance,
        this.maxDistance
      );
    }, { passive: false });

    // 터치 지원 (모바일)
    this.renderer.domElement.addEventListener('touchstart', (e) => {
      if (!this.enableMouseRotation) return;
      if (e.touches.length === 1) {
        this.mouseDown = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.mouseDown || !this.enableMouseRotation) return;
      if (e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        this.currentAngle -= dx * this.mouseSensitivity;
        this.currentHeight = THREE.MathUtils.clamp(
          this.currentHeight - dy * this.mouseSensitivity * 10,
          5, 30
        );
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      this.mouseDown = false;
    });

    // 리사이즈
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    // 직교 카메라 크기 조정
    const aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
    const frustumSize = this.currentDistance * 0.8;
    this.camera.left = -frustumSize * aspect / 2;
    this.camera.right = frustumSize * aspect / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
    this.camera.updateProjectionMatrix();
  }

  /**
   * 카메라 위치/타겟 업데이트 (매 프레임 호출)
   */
  update(deltaTime) {
    // 타겟 부드럽게 이동
    this.currentTarget.lerp(this.target, this.targetLerpFactor);

    // 자동 회전
    if (this.autoRotate && !this.mouseDown) {
      this.currentAngle += this.autoRotateSpeed * deltaTime;
    }

    // 거리/높이 부드럽게 이동
    this.camera.position.lerp(this.getDesiredPosition(), this.lerpFactor);
    this.camera.lookAt(this.currentTarget);

    // 직교 카메라 크기 동적 조정
    this.onResize();
  }

  getDesiredPosition() {
    const x = Math.sin(this.currentAngle) * this.currentDistance;
    const z = Math.cos(this.currentAngle) * this.currentDistance;
    return new THREE.Vector3(
      this.currentTarget.x + x,
      this.currentHeight,
      this.currentTarget.z + z
    );
  }

  updateCamera() {
    this.camera.position.copy(this.getDesiredPosition());
    this.camera.lookAt(this.currentTarget);
    this.onResize();
  }

  /**
   * 타겟 위치 설정 (부드럽게 이동)
   */
  setTarget(target, immediate = false) {
    if (immediate) {
      this.currentTarget.copy(target);
      this.target.copy(target);
    } else {
      this.target.copy(target);
    }
  }

  /**
   * 카메라 거리/각도/높이 설정
   */
  setView({ distance, angle, height }, immediate = false) {
    if (distance !== undefined) {
      if (immediate) this.currentDistance = distance;
      this.distance = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance);
    }
    if (angle !== undefined) {
      if (immediate) this.currentAngle = angle;
      this.angle = angle;
    }
    if (height !== undefined) {
      if (immediate) this.currentHeight = height;
      this.height = THREE.MathUtils.clamp(height, 5, 30);
    }
  }

  /**
   * 특정 위치로 카메라 이동 (씬 전환용)
   */
  moveTo(target, options = {}) {
    const moveId = (this.moveId || 0) + 1;
    this.moveId = moveId;
    const {
      distance = this.distance,
      angle = this.angle,
      height = this.height,
      duration = 1.5,
      onComplete
    } = options;

    const startTarget = this.currentTarget.clone();
    const startDistance = this.currentDistance;
    const startAngle = this.currentAngle;
    const startHeight = this.currentHeight;

    const targetDistance = distance;
    const targetAngle = angle;
    const targetHeight = height;

    if (duration <= 0) {
      this.target.copy(target);
      this.currentTarget.copy(target);
      this.distance = targetDistance;
      this.currentDistance = targetDistance;
      this.angle = targetAngle;
      this.currentAngle = targetAngle;
      this.height = targetHeight;
      this.currentHeight = targetHeight;
      this.updateCamera();
      onComplete?.();
      return;
    }

    let elapsed = 0;

    const animate = (deltaTime) => {
      if (moveId !== this.moveId) return;
      elapsed += deltaTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = THREE.MathUtils.smootherstep(t, 0, 1);

      this.currentTarget.lerpVectors(startTarget, target, easedT);
      this.currentDistance = THREE.MathUtils.lerp(startDistance, targetDistance, easedT);
      this.currentAngle = THREE.MathUtils.lerp(startAngle, targetAngle, easedT);
      this.currentHeight = THREE.MathUtils.lerp(startHeight, targetHeight, easedT);

      this.updateCamera();

      if (t < 1) {
        requestAnimationFrame(() => animate(1/60));
      } else if (onComplete) {
        onComplete();
      }
    };

    animate(0);
  }

  /**
   * 마우스 회전 활성화/비활성화
   */
  setMouseRotation(enabled) {
    this.enableMouseRotation = enabled;
    this.renderer.domElement.style.cursor = enabled ? 'grab' : 'default';
  }

  dispose() {
    // 이벤트 리스너 정리 필요시 구현
  }
}

/**
 * 직교 카메라 생성 헬퍼
 */
export function createOrthographicCamera(renderer, options = {}) {
  const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
  const frustumSize = (options.distance || 25) * 0.8;

  const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    options.near || 0.1,
    options.far || 100
  );

  camera.position.set(0, options.height || 15, options.distance || 25);
  camera.lookAt(0, 0, 0);

  return camera;
}

export default CameraController;
