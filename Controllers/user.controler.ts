// Controllers/user.controller.ts
import type { Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { createPatientFromForm, updateUserPhoto } from '../Models/user.model';
import type { PatientFormData } from '../Models/user.model';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/profiles');
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "+" + Math.round(Math.random() * 1e9);
    cb(null, 'profile' + "+" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

const patientSchema = z.object({
  nom: z.string().min(2, 'Nom trop court'),
  prenom: z.string().min(2, 'Prénom trop court'),
  genre: z.enum(['Masculin', 'Féminin']),
  datenaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date invalide (YYYY-MM-DD)'),
  lieudenaissance: z.string().min(2, 'Lieu de naissance requis'),
  villeresidence: z.string().min(2, 'Province requise'),
  quartier: z.string().min(2, 'Quartier requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().regex(/^\d{10}$/, 'Téléphone doit contenir 10 chiffres'),
  situation: z.enum(['Marié', 'Divorcé(e)', 'Célibataire', 'Veuf/Veuve']),
  profession: z.string().min(2, 'Profession requise'),
  groupesanguin: z.string().min(2, 'Groupe sanguin requis')
});

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const validated = patientSchema.parse(req.body);

    const patientData: PatientFormData = {
      nom: validated.nom,
      prenom: validated.prenom,
      genre: validated.genre,
      datenaissance: new Date(validated.datenaissance),
      lieudenaissance: validated.lieudenaissance,
      villeresidence: validated.villeresidence,
      quartier: validated.quartier,
      email: validated.email,
      telephone: validated.telephone,
      situation: validated.situation,
      profession: validated.profession,
      groupesanguin: validated.groupesanguin,
      photoUploaded: false
    };

    const utilisateurId = await createPatientFromForm(patientData);

    return res.status(201).json({
      message: 'Patient créé avec succès',
      utilisateurId: utilisateurId
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.issues.map(e => e.message)
      });
    }
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const uploadUserPhoto = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucune photo fournie' });
    }

    const photoUrl = '/uploads/profiles/' + req.file.filename;

    await updateUserPhoto(userId, photoUrl);

    return res.status(200).json({
      message: 'Photo mise à jour',
      photoUrl: photoUrl
    });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload de la photo' });
  }
};

export const uploadProfileMiddleware = upload.single('photo');