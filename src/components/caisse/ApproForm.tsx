/**
 * Formulaire pour créer un approvisionnement (APPRO)
 */

import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { createAppro } from "@services/caisse.service";
import type { MouvementCaisse } from "@types";
import { useAuth } from "@hooks/useAuth";

const { TextArea } = Input;

interface ApproFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  idCaisse: number;
  soldeActuel?: number;
}

export const ApproForm: React.FC<ApproFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  idCaisse,
  soldeActuel = 0,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const data: Partial<MouvementCaisse> = {
        date: values.date.format("YYYY-MM-DD"),
        type: "APPRO",
        libelle: values.libelle,
        montant: values.montant,
        id_caisse: idCaisse,
        code_user: user?.code_user || "",
        etat: 1, // Validé par défaut
        solde: soldeActuel + values.montant, // Calcul du nouveau solde
      };

      await createAppro(data);

      message.success("Approvisionnement créé avec succès");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error(
        "Erreur lors de la création de l'approvisionnement:",
        error
      );
      message.error(
        error?.response?.data?.message ||
        "Erreur lors de la création de l'approvisionnement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nouvel Approvisionnement (APPRO)"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText="Enregistrer"
      cancelText="Annuler"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
        }}
      >
        <Form.Item
          name="date"
          label="Date"
          rules={[
            { required: true, message: "Veuillez sélectionner une date" },
          ]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="libelle"
          label="Libellé"
          rules={[{ required: true, message: "Veuillez saisir un libellé" }]}
        >
          <TextArea rows={3} placeholder="Description de l'approvisionnement" />
        </Form.Item>

        <Form.Item
          name="montant"
          label="Montant"
          rules={[
            { required: true, message: "Veuillez saisir un montant" },
            {
              type: "number",
              min: 0.01,
              message: "Le montant doit être supérieur à 0",
            },
          ]}
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            placeholder="Montant en FCFA"
            min={0}
            step={1000}
            formatter={(value: any) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
            }
            parser={(value: any) => Number(value?.replace(/\s?/g, "") || "0")}
          />
        </Form.Item>

        {soldeActuel !== undefined && (
          <Form.Item label="Solde actuel">
            <Input
              value={soldeActuel.toLocaleString("fr-FR") + " FCFA"}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
