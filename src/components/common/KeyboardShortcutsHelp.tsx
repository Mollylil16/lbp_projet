/**
 * Panneau d'aide sur les raccourcis clavier (touche ?)
 * Accessible via keyboard, rôle dialog avec focus trap
 */
import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './KeyboardShortcutsHelp.css';

const { Text } = Typography;

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: 'H', description: 'Tableau de bord', category: 'Navigation' },
  { key: 'C', description: 'Colis', category: 'Navigation' },
  { key: 'F', description: 'Factures', category: 'Navigation' },
  { key: 'P', description: 'Paiements', category: 'Navigation' },
  { key: 'G', description: 'Caisse', category: 'Navigation' },
  { key: '?', description: 'Afficher cette aide', category: 'Aide' },
  { key: 'Échap', description: 'Fermer une modale', category: 'Actions' },
  { key: 'Tab', description: 'Élément focusable suivant', category: 'Navigation' },
  { key: 'Maj + Tab', description: 'Élément focusable précédent', category: 'Navigation' },
];

const columns = [
  {
    title: 'Touche',
    dataIndex: 'key',
    key: 'key',
    width: 140,
    render: (key: string) => (
      <span className="kbd-badge" aria-label={`Touche ${key}`}>
        {key}
      </span>
    ),
  },
  {
    title: 'Action',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Catégorie',
    dataIndex: 'category',
    key: 'category',
    render: (cat: string) => (
      <Tag color={cat === 'Navigation' ? 'blue' : cat === 'Actions' ? 'green' : 'default'}>
        {cat}
      </Tag>
    ),
  },
];

export const KeyboardShortcutsHelp: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isTyping) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      title={
        <span>
          <InfoCircleOutlined style={{ marginRight: 8 }} aria-hidden="true" />
          Raccourcis clavier
        </span>
      }
      width={560}
      aria-modal="true"
      aria-label="Aide sur les raccourcis clavier"
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
        Ces raccourcis fonctionnent quand le curseur n'est pas dans un champ de saisie.
      </Text>
      <Table
        dataSource={SHORTCUTS}
        columns={columns}
        rowKey="key"
        size="small"
        pagination={false}
        aria-label="Liste des raccourcis clavier disponibles"
      />
    </Modal>
  );
};
