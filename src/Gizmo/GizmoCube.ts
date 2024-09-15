import * as THREE from 'three';

export class GizmoCube {
  // Константы для размеров
  private readonly CUBE_SIZE = 2; // Размер грани большого куба
  private readonly EDGE_SECTION_SIZE = 0.4; // Размер сечения ребер и угловых кубиков
  private readonly FACE_THICKNESS = 0.4; // Толщина параллелепипеда на грани
  private readonly CANVAS_SIZE = 256; // Размер канваса для текстур
  private readonly FONT_SIZE = '48px'; // Размер шрифта для текста на канвасе
  private readonly BACKGROUND_COLOR = '#E7E7E7'; // Цвет фона для текстуры
  private readonly TEXT_COLOR = '#000000'; // Цвет текста
  private readonly TEXT_ALIGN = 'center'; // Выравнивание текста
  private readonly TEXT_BASELINE = 'middle'; // Положение текста по вертикали
  private readonly FACE_COLOR = this.BACKGROUND_COLOR; // Цвет полупрозрачных параллелепипедов
  private readonly FACE_OPACITY = 1; // Прозрачность параллелепипедов
  private readonly EDGE_COLOR = this.BACKGROUND_COLOR; // Цвет реберных боксов
  private readonly CORNER_COLOR = this.BACKGROUND_COLOR; // Цвет угловых кубиков
  private readonly LINE_COLOR = 0x000000; // Цвет каркаса

  // Функция для создания текстуры с текстом на канвасе
  private createTextTexture(text: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = this.CANVAS_SIZE;
    canvas.height = this.CANVAS_SIZE;

    // Устанавливаем полностью прозрачный фон
    context!.clearRect(0, 0, canvas.width, canvas.height); // Прозрачный фон

    // Настраиваем свойства текста и рисуем текст на канвасе
    context!.font = `${this.FONT_SIZE} Arial`;
    context!.fillStyle = this.TEXT_COLOR;  // Цвет текста (непрозрачный)
    context!.textAlign = this.TEXT_ALIGN as CanvasTextAlign;
    context!.textBaseline = this.TEXT_BASELINE as CanvasTextBaseline;
    context!.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;  // Убедимся, что текстура обновляется
    return texture;
  }

  private _create() {
    // Группа для содержимого куба и его каркаса
    const group = new THREE.Group();
    group.name = 'Gizmo Group';

    // Создаем каркас для ребер куба
    const cubeGeometry = new THREE.BoxGeometry(this.CUBE_SIZE, this.CUBE_SIZE, this.CUBE_SIZE);
    const edges = new THREE.EdgesGeometry(cubeGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: this.LINE_COLOR });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    wireframe.name = 'Wireframe';
    group.add(wireframe);

    // Добавляем боксы на ребра куба
    const edgeLength = this.CUBE_SIZE; // Длина ребра куба

    // Новая длина ребра с учетом кубиков в углах
    const adjustedEdgeLength = edgeLength - this.EDGE_SECTION_SIZE;

    const halfSize = this.CUBE_SIZE / 2;
    const edgePositions = [
      { axis: 'x', pos: { x: 0, y: halfSize, z: -halfSize } },
      { axis: 'x', pos: { x: 0, y: halfSize, z: halfSize } },
      { axis: 'x', pos: { x: 0, y: -halfSize, z: -halfSize } },
      { axis: 'x', pos: { x: 0, y: -halfSize, z: halfSize } },
      { axis: 'y', pos: { x: halfSize, y: 0, z: -halfSize } },
      { axis: 'y', pos: { x: halfSize, y: 0, z: halfSize } },
      { axis: 'y', pos: { x: -halfSize, y: 0, z: -halfSize } },
      { axis: 'y', pos: { x: -halfSize, y: 0, z: halfSize } },
      { axis: 'z', pos: { x: halfSize, y: halfSize, z: 0 } },
      { axis: 'z', pos: { x: halfSize, y: -halfSize, z: 0 } },
      { axis: 'z', pos: { x: -halfSize, y: halfSize, z: 0 } },
      { axis: 'z', pos: { x: -halfSize, y: -halfSize, z: 0 } }
    ];

    edgePositions.forEach(({ axis, pos }, index) => {
      let width = this.EDGE_SECTION_SIZE,
        height = this.EDGE_SECTION_SIZE,
        depth = this.EDGE_SECTION_SIZE;

      if (axis === 'x') {
        width = adjustedEdgeLength;
      } else if (axis === 'y') {
        height = adjustedEdgeLength;
      } else if (axis === 'z') {
        depth = adjustedEdgeLength;
      }

      const boxGeometry = new THREE.BoxGeometry(width, height, depth);
      const edgeMaterial = new THREE.MeshStandardMaterial({ color: this.EDGE_COLOR }); // зеленые боксы
      const edge = new THREE.Mesh(boxGeometry, edgeMaterial);
      edge.position.set(pos.x, pos.y, pos.z);
      edge.name = `Edge Box ${index + 1}`;
      group.add(edge);
    });

    // Добавляем кубики в углы куба
    const cornerSize = this.EDGE_SECTION_SIZE;

    const cornerPositions = [
      { x: -halfSize, y: -halfSize, z: -halfSize },
      { x: -halfSize, y: -halfSize, z: halfSize },
      { x: -halfSize, y: halfSize, z: -halfSize },
      { x: -halfSize, y: halfSize, z: halfSize },
      { x: halfSize, y: -halfSize, z: -halfSize },
      { x: halfSize, y: -halfSize, z: halfSize },
      { x: halfSize, y: halfSize, z: -halfSize },
      { x: halfSize, y: halfSize, z: halfSize },
    ];

    cornerPositions.forEach((pos, index) => {
      const cornerGeometry = new THREE.BoxGeometry(cornerSize, cornerSize, cornerSize);
      const cornerMaterial = new THREE.MeshStandardMaterial({ color: this.CORNER_COLOR });
      const cornerCube = new THREE.Mesh(cornerGeometry, cornerMaterial);
      cornerCube.position.set(pos.x, pos.y, pos.z);
      cornerCube.name = `Corner Cube ${index + 1}`;
      group.add(cornerCube);
    });

    // Полупрозрачные синие параллелепипеды с текстом на каждой грани куба
    const faceLabels = ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'FRONT', 'BACK'];
    const facePositions = [
      { pos: [0, 0, halfSize], rotation: [0, 0, 0] }, // Front
      { pos: [0, 0, -halfSize], rotation: [0, Math.PI, 0] }, // Back (был неправильно ориентирован, поправил)
      { pos: [halfSize, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Right
      { pos: [-halfSize, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // Left (знак вращения)
      { pos: [0, halfSize, 0], rotation: [-Math.PI / 2, 0, 0] }, // Top (знак вращения)
      { pos: [0, -halfSize, 0], rotation: [Math.PI / 2, 0, 0] }, // Bottom
    ];

    facePositions.forEach(({ pos, rotation }, index) => {
      // Создаем отдельную группу для бокса и текстового плейна
      const faceGroup = new THREE.Group();

      // Основной материал для бокс-грани
      const faceGeometry = new THREE.BoxGeometry(
        this.CUBE_SIZE - this.EDGE_SECTION_SIZE,
        this.CUBE_SIZE - this.EDGE_SECTION_SIZE,
        this.FACE_THICKNESS
      );
      const faceMaterial = new THREE.MeshStandardMaterial({
        color: 0xE7E7E7,  // Цвет фона (бежевый)
      });
      const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
      faceMesh.name = `Face Box ${faceLabels[index]}`;
      faceGroup.add(faceMesh);

      // Прозрачный плейн для текстуры
      const planeGeometry = new THREE.PlaneGeometry(this.CUBE_SIZE - this.EDGE_SECTION_SIZE, this.CUBE_SIZE - this.EDGE_SECTION_SIZE);
      const textMaterial = new THREE.MeshStandardMaterial({
        map: this.createTextTexture(faceLabels[index]),  // Текстура с текстом
        transparent: true,  // Включаем прозрачность
        depthWrite: false,  // Отключаем запись в буфер глубины для текстуры
      });
      const textPlane = new THREE.Mesh(planeGeometry, textMaterial);
      textPlane.position.set(0, 0, this.FACE_THICKNESS / 2 + 0.01); // Поднимаем текстовый плейн немного над поверхностью
      faceGroup.add(textPlane);

      // Позиционируем и поворачиваем всю группу
      faceGroup.position.set(pos[0], pos[1], pos[2]);
      faceGroup.rotation.set(rotation[0], rotation[1], rotation[2]);

      group.add(faceGroup);
    });

    return group;
  }


  public create() {
    return this._create();
  }
}
